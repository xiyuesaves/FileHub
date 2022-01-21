const fs = require('fs');
// 判断显示路径是否可用
const checkShowPath = function(path) {
    console.log("显示路径", path)
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
    console.log("显示路径有效")
    return isok
}

// 判断真实路径是否可用
const checkRealPath = function(path) {
    console.log("真实路径", path)
    try {
        fs.accessSync(path, fs.constants.W_OK | fs.constants.R_OK)
        if (/:$/.test(path)) {
            throw "结尾不能为:"
        }
        console.log("真实路径有效")
        return true
    } catch (err) {
        console.log("真实路径无效",err)
        return false
    }
}

module.exports = { checkShowPath, checkRealPath }