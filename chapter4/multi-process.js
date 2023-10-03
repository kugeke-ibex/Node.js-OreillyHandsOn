'use strict'
const { fork, setupMaster } = require('cluster')

console.log('メインプロセス', process.pid)
// サブプロセスが実行するファイルの指定
setupMaster({ exec: `${__dirname}/web-app` })

// CPUコアの数だけプロセスをフォーク
const cpuCount = require('os').cpus().length
for (let i = 0; i < cpuCount; i++) {
    const sub = fork()
    console.log('サブプロセス', sub.process.pid)
}

//setupMaster()の引数を省略した場合はデフォルトではfork()を実行しているのと同じファイル(ここではmulti-process.js)がサブプロセスでも実行される。



