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
const db = require('better-sqlite3')('./testfileHub.db'); // sqlite数据库
const sessionDb = require('better-sqlite3')('./testfileHub.db'); // sqlite数据库
const SqliteStore = require("better-sqlite3-session-store")(session);

// 模块
const { decode, encode } = require('./modules/escape.js'); // 编解码
const initDatabase = require('./modules/initDatabase.js'); // 初始化数据库
const { checkShowPath, checkRealPath } = require('./modules/checkPath.js'); // 初始化数据库

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
const io = new Server(server, {
  cors: corsOption
});

// socket启用session
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
})

// 调试时需要启用cors
app.use(cors(corsOption));

// 判断是否需要初始化
const noData = initDatabase(db);
console.log(noData ? "需要初始化" : "已初始化")

// 状态判断
app.get("/status", function(req, res) {
  if (req.session.islogin) { // 已登录
    res.json({
      status: true,
      init: false,
      code: 0,
      userId: req.session.userId,
      userName: req.session.userName,
      userLevel: req.session.userLevel,
      msg: ""
    })
  } else if (noData) { // 无数据库,需要初始化
    res.json({
      status: false,
      init: true,
      code: -1,
      msg: "需要初始化"
    })
  } else { // 未登录
    res.json({
      status: false,
      init: false,
      code: -2,
      msg: "未登录"
    })
  }
})

// 登录接口
app.post("/login", function(req, res) {
  const data = req.body.data
  // 如果已登录则返回false
  console.log(data)
  if (req.session.islogin) {
    res.json({
      status: false,
      code: 3,
      msg: "已登录"
    })
    return
  }
  // 检测数据是否正常
  if (!data) {
    res.json({
      status: false,
      code: 5,
      msg: "请求被拒绝"
    })
    return
  }
  if (!data.userName || data.userName.length < 2 || data.userName.length > 8) {
    res.json({
      status: false,
      code: 3,
      msg: "用户名长度错误"
    })
    return
  }
  if (!data.password || data.password.length < 6 || data.password.length > 18) {
    res.json({
      status: false,
      code: 4,
      msg: "密码长度错误"
    })
    return
  }

  // 进数据库查询
  let loginInfo = db.prepare("SELECT userLevel,userId FROM user WHERE userName = ? AND password = ?").get(data.userName, md5(data.password))
  console.log("登录请求\n", data, loginInfo)

  // 用户等级 0 管理员 1 普通用户 2 禁用用户
  if (!loginInfo) {
    res.json({
      status: false,
      code: 1,
      msg: "账号或密码错误"
    })
    return
  }
  if (loginInfo.userLevel === 2) {
    res.json({
      status: false,
      code: 2,
      msg: "账号已被禁用"
    })
    return
  }

  req.session.islogin = true;
  req.session.userId = loginInfo.userId;
  req.session.userName = data.userName;
  req.session.userLevel = loginInfo.userLevel;
  req.session.rootList = db.prepare("SELECT a.showPath,a.realPath FROM path a, user_path b WHERE a.pathId = b.pathId AND b.userId = ?").all(loginInfo.userId);
  console.log(`${req.session.userName} 登录成功`)
  res.json({
    status: true,
    code: 0,
    msg: ""
  })
})

// 注册接口
app.post("/register", function(req, res) {
  const data = req.body.data;
  // 除了初始化外,只有管理员能创建账号
  if (req.session.userLevel !== 0 && !noData) {
    res.json({
      status: false,
      code: 3,
      msg: "没有权限"
    })
    return
  }
  // 检查携带数据
  if (!data) {
    res.json({
      status: false,
      code: 4,
      msg: "请求被拒绝"
    })
    return
  }
  if (!data.userName || data.userName.length < 2 || data.userName.length > 8) {
    res.json({
      status: false,
      code: 1,
      msg: "用户名长度错误"
    })
    return
  }
  if (!data.password || data.password.length < 6 || data.password.length > 18) {
    res.json({
      status: false,
      code: 2,
      msg: "密码长度错误"
    })
    return
  }

  // 判断用户名是否重复
  let checkUser = db.prepare("SELECT userName FROM user WHERE userName = ?").get(data.userName)
  if (checkUser) {
    res.json({
      status: false,
      code: 5,
      msg: "用户名已被使用"
    })
    return
  }

  // 如果是创建第一个账号,则默认为管理员
  let userLevel = noData ? 0 : 1;
  db.prepare("INSERT INTO user (userName,password,userLevel) VALUES (?,?,?)").run(data.userName, md5(data.password), userLevel)
  // 如果是初始账号,则写入session
  if (noData) {
    noData = false;
    req.session.userId = db.prepare("SELECT userId FROM user WHERE userName = ?").get(data.userName).userId
    req.session.userName = data.userName;
    req.session.userLevel = userLevel;
    req.session.islogin = true;
    req.session.rootList = [];
  }
  res.json({
    status: true,
    code: 0,
    msg: ""
  })
})

// 登录判断
app.all("*", function(req, res, next) {
  if (!req.session.islogin) {
    res.json({
      status: false,
      code: 1,
      msg: "未登录"
    })
    return
  }
  next();
})

// 获取路径
app.post("/getPaths", function(req, res) {
  let paths = req.session.rootList
  if (paths.length) {
    paths = db.prepare("SELECT a.showPath,a.realPath FROM path a, user_path b WHERE a.pathId = b.pathId AND b.userId = ?").all(req.session.userId);
  }
  let showPath = paths.map(item => {
    return {
      rootPath: item.showPath
    }
  })
  console.log("请求目录列表\n", showPath)
  res.json({
    status: true,
    code: 0,
    msg: "",
    data: showPath
  })
})

// 添加路径
app.post("/addPaths", function(req, res) {
  const data = req.body.data;
  /* 
    {
      userId:0,
      pathList:[
        {
            "showPath": "332",
            "realPath": "C:/",
        },
        {
            "showPath": "123",
            "realPath": "D:/",
        }
      ]
      
    }
  */

  // 只有管理员可以修改用户路径
  if (req.session.userLevel !== 0) {
    res.json({
      status: false,
      code: 1,
      msg: "没有权限"
    })
    return
  }

  // 判断用户是否存在
  let checkUser = db.prepare("SELECT * FROM user WHERE userId = ?").get(data.userId)
  if (!checkUser) {
    res.json({
      status: false,
      code: 2,
      msg: "用户不存在"
    })
    return
  }

  // 检查路径是否有问题
  const errList = data.pathList.map(function(json, index) {
    console.log(json, index)
    return {
      num: index,
      show: checkShowPath(json.showPath),
      real: checkRealPath(json.realPath)
    }
  })
  
  console.log(errList)
  res.json({
    status: false,
    code: 2,
    msg: "无错误"
  })
})
// 删除路径
app.post("/deletePaths", function(req, res) {
  const data = req.body.data;
  // 只有管理员可以修改用户路径
  if (req.session.userLevel !== 0) {
    res.json({
      status: false,
      code: 1,
      msg: "没有权限"
    })
    return
  }

})

// 退出登录
app.post("/loginout", function(req, res) {
  req.session.destroy(function() {
    res.json({
      status: true,
      code: 0,
      msg: "已退出登录"
    })
  })
})

server.listen(89);
