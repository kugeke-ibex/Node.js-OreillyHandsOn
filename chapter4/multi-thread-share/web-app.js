'use strict'
const http = require('http')
const cpuCount = require('os').cpus().length
const ThreadPool = require('../thread-pool')

// 長さ1のInt32Arrayインスタンスを生成い
const sharedArrayBuffer = new SharedArrayBuffer(4)
const int32Array = new Int32Array(sharedArrayBuffer)

const threadPool = new ThreadPool(
    cpuCount,
    `${__dirname}/fibonacci.js`,
    { workerData : int32Array } //Int32Arrayインスタンスをスレッドプールに渡す
)

// メインスレッド側のカウンタ
let count = 0;
http.createServer(async (req, res) => {
    // /callsに対してはトラッキングしているリクエスト回数を返す
    if (req.url === '/calls') {
        return res.end(`Main = ${count}, Sub = ${int32Array[0]}`)
    }
    const n = Number(req.url.substr(1))
    if (Number.isNaN(n)) {
        return res.end()
    }
    count += 1
    const result = await threadPool.executeInThread(n)
    res.end(result.toString())
}).listen(3000)

// 値をコピーしないで、他スレッドに渡すもう一つの方法はSharedArrayBuffer
// SharedArrayBufferは固定長の共有可能なバイナリデータのバッファです。
// そのものがバイナリデータなので、これをプログラム上で操作するにはビューと呼ばれるものでラップする必要があります。
// ビューにはTypedArrayが使われます。TypedArrayはUint8ArrayやInt32Arrayなど、決まった型の値が入る配列です。
// 一つのSharedArrayBufferインスタんを複数のビューでラップすることもでき、その場合一方のビューからの変更は他方のビューにも反映されます。
// const sharedArrayBuffer = new SharedArrayBuffer(1024)
// const uint8Array = new Uint8Array(sharedArrayBuffer)
// const int32Array = new Uint32Array(sharedArrayBuffer)
// uint8Array.length
// int32Array.length
// int32Array[0] = 1000
// uint8Array.slice(0, 4)