const express = require("express");
const app = express(); // 接口服务
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const fs = require('fs');
const path = require('path');
const staticServer = express(); // 静态文件服务
const cors = require("cors"); // 跨域组件
const session = require('express-session');
const bodyParser = require("body-parser");
const mm = require('music-metadata');
const md5 = require('js-md5');
const db = require('better-sqlite3')('./fileHub.db'); // sqlite数据库
const sessionDb = require('better-sqlite3')('./fileHub.db'); // sqlite数据库
const SqliteStore = require("better-sqlite3-session-store")(session)

// 模块
const { decode, encode } = require('./modules/escape.js');
const initDatabase = require('./modules/initDatabase.js');

// session中间件配置
const sessionMiddleware = session({
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
})
// cors配置
const corsOption = { origin: ['http://192.168.0.103:8080'], credentials: true, }

// 中间件
app.use(bodyParser.json());
app.use(sessionMiddleware);
const io = new Server(server, { cors: corsOption });
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
})

// 调试时需要启用cors
app.use(cors(corsOption));

let isInit = initDatabase(db), // 判断是否需要初始化
  allRootList = [];
let userlist = db.prepare("SELECT userId FROM user").all()
if (!userlist.length) {
  isInit = true
}
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
    req.session.userName = data.name;
    req.session.userId = loginInfo.userId;
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
let onReg = false
app.post('/initialization', function(req, res) {
  if (isInit && !onReg) {
    console.log("用户注册")
    let userName = req.body.data.name,
      password = req.body.data.password
    if (userName.length >= 2 && userName.length <= 8) {
      if (password.length >= 6 && password.length <= 18) {
        db.prepare("INSERT INTO user (userName,password,userLevel) VALUES (?,?,0)").run(userName, md5(password))
        req.session.userId = db.prepare("SELECT userId FROM user WHERE userName = ?").get(userName).userId
        req.session.islogin = true;
        req.session.userName = userName;
        req.session.rootList = [];
        isInit = false;
        onReg = true
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
// 静态资源文件夹
app.use("/static", express.static(path.join(__dirname, '../dist/static')));

// 登录验证
app.get('/login', function(req, res) {
  if (req.session.islogin) {
    if (!req.session.rootList.length) {
      req.session.rootList = db.prepare("SELECT a.showPath,a.realPath FROM path a, user_path b WHERE a.pathId = b.pathId AND b.userId = ?").all(req.session.userId);
    }
    if (req.session.rootList.length) {
      res.json({
        status: true,
        userId: req.session.userId
      })
    } else {
      res.json({
        status: false,
        init: true,
        code: -2,
        msg: "需要初始化路径"
      })
    }
  } else if (isInit) {
    res.json({
      status: false,
      init: true,
      code: -1,
      msg: "需要初始化"
    })
  } else {
    res.json({
      status: false,
      code: 0,
      msg: "需要登录"
    })
  }
});

// 图标
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../src/assets/logo.png'))
})

// 登录验证
app.all('*', function(req, res, next) {
  // console.log(req.session.userName, "请求路径", req.path)
  if (isInit) {
    if (!req.session.userId) {
      req.session.islogin = false
    }
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  } else if (req.session.islogin) {
    next();
  } else {
    req.session.islogin = false
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  }
})

// 同步板接口
io.on('connection', (socket) => {
  let userId = socket.request.session.userId
  if (userId) {
    console.log(socket.request.session.userName, "已建立连接,移入对应房间")
    socket.join(userId)
    socket.on("getMessage", () => {
      console.log("获取初始文本数据")
      let msg = db.prepare("SELECT guestbook FROM user WHERE userId = ?").get(userId);
      socket.emit("newMessage", msg.guestbook)
    })
    socket.on("updateMessage", (msg) => {
      console.log("更新信息", msg)
      db.prepare("UPDATE user SET guestbook = ? WHERE userId = ?").run(msg, userId)
      socket.to(userId).emit("newMessage", msg)
    })
  } else {
    console.log("没有userId")
  }
})

// 新增路径
app.post('/addPath', function(req, res) {
  let data = req.body.data
  console.log("判断路径是否有误", data)
  let isOk = true,
    errList = []
  for (var i = 0; i < data.length; i++) {
    if (!data[i].errorShow && !data[i].errorReal) {
      if (checkShowPath(data[i].showPath, )) { // 判断显示路径是否有效
        if (checkRealPath(data[i].realPath)) { // 判断真实路径是否有效
          console.log("检测通过", data[i])
        } else {
          isOk = false
          errList.push({
            num: i,
            show: 0,
            real: 1
          })
        }
      } else {
        isOk = false
        errList.push({
          num: i,
          show: 1,
          real: 0
        })
      }
    } else {
      isOk = false
      errList.push({
        num: i,
        show: !data[i].errorShow,
        real: !data[i].errorReal
      })
    }
  }
  if (isOk) {
    let userId = req.session.userId
    addPath(data, userId)
    res.json({
      status: true
    })
  } else {
    res.json({
      status: false,
      code: 0,
      msg: "路径信息有误",
      errList
    })
  }
})

// 获取根目录接口
app.get('/getRootList', function(req, res) {
  if (req.session.islogin && req.session.rootList.length) {
    let paths = req.session.rootList
    if (paths.length) {
      paths = db.prepare("SELECT a.showPath,a.realPath FROM path a, user_path b WHERE a.pathId = b.pathId AND b.userId = ?").all(req.session.userId);
    }
    let showPath = paths.map(item => {
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
app.post('/info/*', async function(req, res) {
  let path = getRealPath(req.url.replace("/info/", ""), req)
  if (authorizedRootDirectory(path, req)) {
    console.log("获取媒体信息", path)
    try {
      let stats = fs.statSync(path);
      if (stats.isFile()) {
        let info = await mm.parseFile(path)
        res.json({ common: info.common });
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
function addRawPath(rootList) {
  // console.log("加载虚拟文件地址",rootList)
  for (var i = 0; i < rootList.length; i++) {
    // console.log((`/raw/${rootList[i].showPath.replace(/\/$/,"")}`), " ==> ", encode(`/raw/${rootList[i].showPath.replace(/\/$/,"/*").replace(/$/,"/*")}`), )
    app.get(encode(`/raw/${rootList[i].showPath.replace(/\/$/,"/*").replace(/$/,"/*")}`), (req, res, next) => {
      let path = getRealPath(req.path.replace("/raw/", ""), req)
      // console.log("请求源文件", path)
      if (authorizedRootDirectory(path, req)) {
        next()
      } else {
        console.log("拒绝未授权目录的raw请求")
        res.status(404);
        res.end();
      }
    })
    app.use(encode(`/raw/${rootList[i].showPath.replace(/\/$/,"")}`), express.static(`${rootList[i].realPath}`));
  }
}
addRawPath(allRootList)

app.use("/*", express.static(path.join(__dirname, '../dist')));
server.listen(88);
// 静态文件映射
// staticServer.use("/static", express.static(path.join(__dirname,'../dist/static')));
// staticServer.use("/*", express.static(path.join(__dirname,'../dist')));
// staticServer.listen(89);
console.log("fileHub已启动 http://localhost:88")

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


// 判断显示路径是否可用
function checkShowPath(path) {
  let errList = [
      "/"
    ],
    isok = true
  errList.forEach(str => {
    if (path.includes(str)) {
      console.log("显示路径无效")
      isok = false
    }
  })
  console.log("检测显示路径")
  return isok
}

// 判断真实路径是否可用
function checkRealPath(path) {
  console.log("真实路径", path)
  try {
    fs.accessSync(path, fs.constants.W_OK | fs.constants.R_OK)
    if (/:$/.test(path)) {
      throw "error Path"
    }
    console.log("路径有效")
    return true
  } catch (err) {
    console.log("路径无法使用")
    return false
  }
}

// 添加路径
function addPath(data, userId) {
  console.log("添加路径", data, userId)
  if (data && userId) {
    let paths = []
    data.forEach(obj => {
      let lastRowid = db.prepare("INSERT INTO path (showPath,realPath) VALUES (?,?)").run(obj.showPath, obj.realPath).lastInsertRowid
      db.prepare("INSERT INTO user_path (userId,pathId) VALUES (?,?)").run(userId, lastRowid)
      paths.push({
        showPath: obj.showPath,
        realPath: obj.realPath
      })
    })
    addRawPath(paths)
    setTimeout(() => {
      throw "restart"
    }, 500)
    return paths
  } else {
    return false
  }
}
