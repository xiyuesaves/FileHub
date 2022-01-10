let process = require('child_process');
const path = require('path');
let ChildProcess  = process.fork(path.join(__dirname,'./index.js'));
   
ChildProcess.on('exit',function (code) {
    console.log('重启进程');
    if(code !== 0){
        process.fork(path.join(__dirname,'./index.js'));
    }
});