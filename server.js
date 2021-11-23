const express = require("express");
const diskinfo = require('diskinfo');
const fs = require('fs');
const app = express();
const cors = require("cors");

const diskList = [
  { rootPath: "C:/" },
  { rootPath: "D:/" }
]

// diskinfo.getDrives(function(err, aDrives) {
//   for (var i = 0; i < aDrives.length; i++) {
//     diskList.push({
//       rootPath: aDrives[i].mounted
//     })
//   }
// })
app.use(cors());

app.get('/getRootList', function(req, res) {
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



// app.get('/raw/D:/*', function(req, res, next) {
  // 实现文件下载 
  // console.log("请求到下载接口", req.params)
  // var fileName = req.params.fileName;
  // var filePath = path.join(__dirname, fileName);
  // var stats = fs.statSync(filePath); 
  // if(stats.isFile()){
  //   res.set({
  //     'Content-Type': 'application/octet-stream',
  //     'Content-Disposition': 'attachment; filename='+fileName,
  //     'Content-Length': stats.size
  //   });
  //   fs.createReadStream(filePath).pipe(res);
  // } else {
  //   res.end(404);
  // }
// });

// app.use("/raw/C:/",express.static('C:/'));

// app.use("/raw/D:/",express.static('D:/'));

app.use("/static", express.static('dist/static'));
app.use("/*", express.static('dist'));


function getFileType(fileName) {
  let suffix = fileName.split(".")
  suffix = suffix[suffix.length - 1]
  return suffix
}
app.listen(88);
