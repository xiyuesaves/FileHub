const express = require("express");
const fs = require('fs');
const path = require('path');
const app = express(); // 接口服务
const staticServer = express(); // 静态文件服务
const cors = require("cors"); // 跨域组件
const session = require('express-session');
const bodyParser = require("body-parser");
const mm = require('music-metadata');
const md5 = require('js-md5');
const db = require('better-sqlite3')('./server/database/fileHub.db'); // sqlite数据库
const sessionDb = require('better-sqlite3')('./server/database/session.db'); // sqlite数据库

const SqliteStore = require("better-sqlite3-session-store")(session)

// 模块
const { decode, encode } = require('./modules/escape.js');
const initDatabase = require('./modules/initDatabase.js');

app.use(bodyParser.json());

app.use(session({
  store: new SqliteStore({
    client: sessionDb,
    expired: {
      clear: true,
      intervalMs: 604800000
    }
  }),
  secret: 'xiyuesaves',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 604800000
  }
}));

app.use(cors({ origin: ['http://192.168.0.103:8080', 'http://192.168.0.103:89'], credentials: true, }));

let isInit = initDatabase(db), // 判断是否需要初始化
  allRootList = [];
if (!isInit) {
  allRootList = db.prepare("SELECT showPath,realPath FROM path").all()
  console.log("所有共享路径\n", allRootList)
}

// 登录接口
app.post('/login', function(req, res) {
  const data = req.body.data
  let loginInfo = db.prepare("SELECT userLevel,userId FROM user WHERE userName = ? AND password = ?").get(data.name, data.password)
  console.log("登录请求\n", data, loginInfo)
  if (loginInfo && loginInfo.userLevel !== 2) {
    req.session.islogin = true;
    req.session.rootList = db.prepare("SELECT a.showPath,a.realPath FROM path a, user_path b WHERE a.pathId = b.pathId AND b.userId = ?").all(loginInfo.userId);
    console.log("该用户的路径列表\n", req.session.rootList)
    res.json({
      status: true
    })
  } else {
    res.json({
      status: false,
      code: 0
    })
  }
})

// 初始化接口 仅在初始化数据库时启用
if (isInit || false) {
  app.post('/initialization', function(req, res) {
    if (isInit || true) {
      console.log("初始化接口", req.body.data)
      let userName = req.body.data.name,
        password = req.body.data.password
      if (userName.length >= 2 && userName.length <= 8) {
        if (password.length >= 6 && password.length <= 18) {
          db.prepare("INSERT INTO user (userName,password,userLevel) VALUES (?,?,0)").run(userName, md5(password))
          req.session.islogin = true
          res.json({
            status: true
          })
        } else {
          res.json({
            status: false,
            code: 1,
            msg: "密码长度错误"
          })
        }
      } else {
        res.json({
          status: false,
          code: 0,
          msg: "用户名长度错误"
        })
      }
    } else {
      res.status(403);
      res.end();
    }
  })
}


// 登录验证
app.all("*", function(req, res, next) {
  // console.log("请求路径",req.path)
  if (isInit || false) {
    req.session.islogin = false
    res.json({
      status: false,
      init: true,
      code: -1,
      msg: "需要初始化"
    })
  } else if (req.session.islogin) {
    next();
  } else {
    req.session.islogin = false
    res.json({
      status: false,
      code: 0,
      msg: "需要登录"
    })
  }
})

// 登录验证
app.get('/login', function(req, res) {
  if (req.session.islogin) {
    res.json({
      status: true
    })
  } else {
    res.json({
      status: false,
      code: 0,
      msg: "需要登录"
    })
  }
});

// 获取根目录接口
app.get('/getRootList', function(req, res) {
  if (req.session.rootList.length) {
    let showPath = req.session.rootList.map(item => {
      return {
        rootPath: item.showPath
      }
    })
    console.log("请求根目录\n", showPath)
    res.json({
      status: true,
      data: showPath
    })
  } else {
    res.json({
      status: false,
      code: 1,
      msg: "配置信息错误"
    })
  }
});

// 获取路径接口
app.post('/path', function(req, res) {
  let path = getRealPath(req.body.data.path, req)
  console.log("获取路径", path)
  if (authorizedRootDirectory(path, req)) {
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

// 下载文件接口
app.get('/download/*', function(req, res) {
  // 实现文件下载
  let path = getRealPath(req.url.replace("/download/", ""), req)
  if (authorizedRootDirectory(path, req)) {
    console.log("下载文件", path)
    try {
      // 判断文件是否有读取权限 如果没有就创建读取流try都没法阻止进程崩溃
      fs.accessSync(path, fs.constants.R_OK);
      let stats = fs.statSync(path),
        fileName = req.url.split("/").pop(),
        range = req.headers.range;
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
    } catch (err) {
      console.log("没有读取权限")
      res.status(403);
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
  let path = getRealPath(req.url.replace("/info/", ""), req)
  if (authorizedRootDirectory(path, req)) {
    console.log("获取媒体信息", path)
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
console.log("启用虚拟文件地址")
for (var i = 0; i < allRootList.length; i++) {
  console.log((`/raw/${allRootList[i].showPath.replace(/\/$/,"")}`), " ==> ", encode(`/raw/${allRootList[i].showPath.replace(/\/$/,"/*").replace(/$/,"/*")}`), )
  app.get(encode(`/raw/${allRootList[i].showPath.replace(/\/$/,"/*").replace(/$/,"/*")}`), (req, res, next) => {
    let path = getRealPath(req.path.replace("/raw/", ""), req)
    console.log("请求源文件", path)
    if (authorizedRootDirectory(path, req)) {
      next()
    } else {
      console.log("拒绝未授权目录的raw请求")
      res.status(404);
      res.end();
    }
  })
  app.use(encode(`/raw/${allRootList[i].showPath.replace(/\/$/,"")}`), express.static(`${allRootList[i].realPath}`));
}

app.listen(88);

// 静态文件映射
staticServer.use("/static", express.static('dist/static'));
staticServer.use("/*", express.static('dist'));
staticServer.listen(89);


// 获取文件类型
function getFileType(fileName) {
  let suffix = fileName.split(".")
  suffix = suffix[suffix.length - 1]
  return suffix
}

// 判断路径权限
function authorizedRootDirectory(getPath, req) {
  let rootList = req.session.rootList
  for (var i = 0; i < rootList.length; i++) {
    if (path.join(getPath.substr(0, rootList[i].realPath.length)) === path.join(rootList[i].realPath)) {
      return true;
    };
  };
  return false;
};

// 转换为真实路径
function getRealPath(urlPath, req) {
  let rootList = req.session.rootList
  let changePath = decode(urlPath)
  pathArr = changePath.split("/");
  for (var i = 0; i < rootList.length; i++) {
    if (pathArr[0] === rootList[i].showPath) {
      pathArr[0] = rootList[i].realPath;
      break;
    };
  };
  let realPath = path.join(pathArr.join("/"));
  // console.log("转换地址", urlPath," ==> ", realPath)
  return realPath;
}
