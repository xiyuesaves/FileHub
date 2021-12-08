const express = require("express");
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require("cors");

const rootList = [
  { rootPath: "C:/" },
  { rootPath: "D:/" }
]

app.use(cors());

app.get('/getRootList', function(req, res) {
  console.log("请求根目录")
  if (rootList.length) {
    res.json({
      status: "success",
      data: rootList
    })
  } else {
    res.json({
      status: "false"
    })
  }
});

app.get('/path/*', function(req, res) {
  let path = decodeURI(req.url.replace('/path/', ''))
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
});

app.get('/download/*', function(req, res, next) {
  // 实现文件下载 
  let filePath = path.join(decodeURI(req.url.replace("/download/", "")))
  if (authorizedRootDirectory(filePath)) {
    try {
      let stats = fs.statSync(filePath);
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
            "Accept-Ranges": "bytes",
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Content-Length': stats.size
          });
          fs.createReadStream(filePath, { start, end }).pipe(res);
        } else {
          res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'attachment; filename=' + fileName,
            'Content-Length': stats.size
          });
          fs.createReadStream(filePath).pipe(res);
        }
      } else {
        console.log("没有找到该文件")
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

// 文件预览接口
for (var i = 0; i < rootList.length; i++) {
  app.use(encodeURI(`/raw/${rootList[i].rootPath.replace(/\/$/,"")}`), express.static(`${rootList[i].rootPath}`));
}

function getFileType(fileName) {
  let suffix = fileName.split(".")
  suffix = suffix[suffix.length - 1]
  return suffix
}
app.listen(88);

// 判断路径权限
function authorizedRootDirectory(getPath) {
  for (var i = 0; i < rootList.length; i++) {
    if (path.join(getPath.substr(0, rootList[i].rootPath.length)) === path.join(rootList[i].rootPath)) {
      return true;
    };
  };
  return false;
};
