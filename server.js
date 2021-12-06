const express = require("express");
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require("cors");

const diskList = [
  { rootPath: "C:/" },
  { rootPath: "D:/" }
]

app.use(cors());

app.get('/getRootList', function(req, res) {
  console.log("请求根目录")
  if (diskList.length) {
    res.json({
      status: "success",
      data: diskList
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
    res.json({
      status: "faild",
      error: err
    })
  }
});

app.get('/raw/*', function(req, res, next) {
  // 实现文件下载 
  let filePath = path.join(decodeURI(req.url.replace("/raw/","")))
  let stats = fs.statSync(filePath);
  let fileName = req.url.split("/").pop();
  console.log("请求到下载接口",filePath,fileName)
  if(stats.isFile()){
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename='+fileName,
      'Content-Length': stats.size
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.end(404);
  }
});

app.use("/static", express.static('dist/static'));
app.use("/*", express.static('dist'));

function getFileType(fileName) {
  let suffix = fileName.split(".")
  suffix = suffix[suffix.length - 1]
  return suffix
}
app.listen(88);
