const express = require("express");
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mm = require('music-metadata');

// 根目录,显示路径不能出现'/#'
const rootList = [
  { showPath: "1233", realPath: "C:/" }
]
let showPath = [] // 展示目录
for (var i = 0; i < rootList.length; i++) {
  showPath.push({
    rootPath: rootList[i].showPath
  })
}

app.use(bodyParser.json());
app.use(cors());

app.get('/getRootList', function(req, res) {
  console.log("请求根目录")
  if (rootList.length) {
    res.json({
      status: "success",
      data: showPath
    })
  } else {
    res.json({
      status: "false"
    })
  }
});

// 获取路径接口
app.post('/path', function(req, res) {
  let path = getRealPath(req.body.data.path)
  console.log("获取路径", path)
  if (authorizedRootDirectory(path)) {
    try {
      let list = fs.readdirSync(path),
        listDetail = [];
      for (var i = 0; i < list.length; i++) {
        try {
          let fileDetail = fs.statSync(`${path}/${list[i]}`)
          listDetail.push({
            type: fileDetail.isDirectory() ? "floder" : getFileType(list[i]),
            name: list[i],
            size: fileDetail.size,
            date: fileDetail.ctime
          })
        } catch (err) {}
      }
      listDetail.sort((a, b) => {
        if (a.type == "floder" && b.type !== "floder") {
          return -1
        } else {
          return 1
        }
      })
      res.json({
        status: "success",
        data: listDetail
      })
    } catch (err) {
      console.log("文件权限错误")
      res.json({
        status: "faild",
        error: err
      })
    }
  } else {
    console.log("拒绝未授权目录的查看请求")
    res.json({
      status: "faild",
      error: {
        code: "EPERM"
      }
    })
  }
})

// app.get('/path/*', function(req, res) {
//   let path = getRealPath(req.url.replace('/path/', ''))
//   console.log("获取路径", path)
//   if (authorizedRootDirectory(path)) {
//     try {
//       let list = fs.readdirSync(path),
//         listDetail = [];
//       for (var i = 0; i < list.length; i++) {
//         try {
//           let fileDetail = fs.statSync(`${path}/${list[i]}`)
//           listDetail.push({
//             type: fileDetail.isDirectory() ? "floder" : getFileType(list[i]),
//             name: list[i],
//             size: fileDetail.size,
//             date: fileDetail.ctime
//           })
//         } catch (err) {}
//       }
//       listDetail.sort((a, b) => {
//         if (a.type == "floder" && b.type !== "floder") {
//           return -1
//         } else {
//           return 1
//         }
//       })
//       res.json({
//         status: "success",
//         data: listDetail
//       })
//     } catch (err) {
//       console.log("文件权限错误")
//       res.json({
//         status: "faild",
//         error: err
//       })
//     }
//   } else {
//     console.log("拒绝未授权目录的查看请求")
//     res.json({
//       status: "faild",
//       error: {
//         code: "EPERM"
//       }
//     })
//   }
// });

// 下载文件接口
app.get('/download/*', function(req, res) {
  // 实现文件下载
  let path = getRealPath(req.url.replace("/download/", ""))
  if (authorizedRootDirectory(path)) {
    console.log("获取文件",path)
    try {
      let stats = fs.statSync(path);
      let fileName = req.url.split("/").pop();
      if (stats.isFile()) {
        let range = req.headers.range
        // 判断是否是分段下载
        if (range) {
          let [, start, end] = range.match(/(\d*)-(\d*)/),
            total = stats.size;
          start = start ? parseInt(start) : 0;
          end = end ? parseInt(end) : total - 1;
          res.status(206);
          res.set({
            'Content-Type': 'application/octet-stream',
            'Accept-Ranges': "bytes",
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Content-Length': stats.size
          });
          fs.createReadStream(path, { start, end }).pipe(res);
        } else {
          res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=' + fileName,
            'Content-Length': stats.size
          });
          fs.createReadStream(path).pipe(res);
        }
      } else {
        console.log("路径不是文件或没有权限")
        res.status(404);
        res.end();
      }
    } catch (err) {
      console.log("没有找到该文件")
      res.status(404);
      res.end();
    }
  } else {
    console.log("拒绝未授权目录的下载请求")
    res.status(404);
    res.end();
  }
});

// 媒体信息接口
app.get('/info/*', async function(req, res) {
  let path = getRealPath(req.url.replace("/info/", ""))
  if (authorizedRootDirectory(path)) {
    console.log("获取媒体信息",path)
    try {
      let stats = fs.statSync(path);
      if (stats.isFile()) {
        let info = await mm.parseFile(path)
        res.json(info);
      } else {
        console.log("路径不是文件或没有权限")
        res.status(404);
        res.end();
      }
    } catch (err) {
      console.log("没有找到该文件")
      res.status(404);
      res.end();
    }
  } else {
    console.log("拒绝未授权目录的下载请求")
    res.status(404);
    res.end();
  }
})

// 文件预览接口
for (var i = 0; i < rootList.length; i++) {
  app.use(encodeURI(`/raw/${rootList[i].showPath.replace(/\/$/,"")}`), express.static(`${rootList[i].realPath}`));
}

app.use("/static", express.static('dist/static'));
app.use("/*", express.static('dist'));

function getFileType(fileName) {
  let suffix = fileName.split(".")
  suffix = suffix[suffix.length - 1]
  return suffix
}
app.listen(88);

// 判断路径权限
function authorizedRootDirectory(getPath) {
  for (var i = 0; i < rootList.length; i++) {
    if (path.join(getPath.substr(0, rootList[i].realPath.length)) === path.join(rootList[i].realPath)) {
      return true;
    };
  };
  return false;
};

// 转换为真实路径
function getRealPath(urlPath) {
  let changePath = decodeURI(urlPath).replace(/%25|%23/g, function(str) {
    switch (str) {
      case "%25":
        return "%";
      case "%23":
        return "#";
      default:
        return str;
    }
  });
  pathArr = changePath.split("/");
  for (var i = 0; i < rootList.length; i++) {
    if (pathArr[0] === rootList[i].showPath) {
      pathArr[0] = rootList[i].realPath;
      break;
    };
  };
  let realPath = path.join(pathArr.join("/"));
  // console.log("转换地址", urlPath, realPath)
  return realPath;
}
