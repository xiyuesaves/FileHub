const express = require("express");
const diskinfo = require('diskinfo');
const fs = require('fs');
const app = express();
const cors = require("cors");


let diskList = []
diskinfo.getDrives(function(err, aDrives) {
  for (var i = 0; i < aDrives.length; i++) {
    diskList.push({
      name: aDrives[i].filesystem,
      driveLetter: aDrives[i].mounted + "/"
    })
  }
})
app.use(cors());

app.get('/getDriveList', function(req, res) {
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

app.use("/raw/C:/",express.static('C:/'));
app.use("/raw/D:/",express.static('D:/'));

app.use("/static",express.static('dist/static'));
app.use("/*",express.static('dist'));


function getFileType(fileName) {
  let suffix = fileName.split(".")
  suffix = suffix[suffix.length - 1]
  return suffix
}
app.listen(88);
