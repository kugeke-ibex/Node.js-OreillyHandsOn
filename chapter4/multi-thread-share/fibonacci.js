'use strict'
const fibonacci = require('../fibonacci')
// workerDataでInt32Arrayインスタンスを受け取る
const { workerData: int32Array, parentPort } = require('worker_threads')

parentPort.on('message', n => {
    parentPort.postMessage(fibonacci(n))
    // 処理のたびに最初の値をインクリメントする
    // int32Array[0] += 1;


    // 競合の可能性を考慮しないと、スレッドセーフが保たれません。
    // SharedArrayBufferによりスレッド間で共有している値をスレッドセーフに扱うには、
    // Atomicsというグローバルオブジェクトが提供するメソッドを利用します。
    // Atomics.add()でint32Arrayの0番目の1をたす。
    // 第一引数に更新対象のTypedArray、第二引数に更新する配列の位置、第三引数に足す値を指定。
    Atomics.add(int32Array, 0, 1)
    // Atomicsadd()以外にも引き算を行うsub()や、ビット演算を行うand()、or()、xor()
    // 任意の値を設定するstore()、exchange()、compareExchange()といったメソッドが存在します。
    // さらに明示的なロックの取得、解放、待機のユースケースに対応するためのwait()やnotify()といったメソッドも提供している。
})