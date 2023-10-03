'uset strict'
const { parentPort, workerData } = require('worker_threads')

parentPort.postMessage(
    workerData.buffer,
    // postMessage()の第二引数に転送オブジェクトを指定
    workerData.transfer ? [workerData.buffer] : []
)
// 値をコピーしないで、ほかスレッドに渡す方法の一つは、転送(transfer)と呼ばれるものです。
// 元のスレッドではそのオブジェクトを利用できなくなる
// 転送に可能なオブジェクトを転送可能オブジェクトと呼ぶ。
// ・ArrayBuffer : 固定長のバイナリデータのバッファを表すオブジェクt
// ・MessagePort : スレッド間通信のためのポートを表すオブジェクト
// ・FileHandle : ファイル記述子のラッパーオブジェクト

function useMaybeTransfer(transfer) {
    // 1GBのArrayBufferを生成
    const buffer = new ArrayBuffer(1024 * 1024 * 1024)
    // 現在時刻を記録
    const start = perf_hooks.performance.now()
    new worker_threads.Worker(
        './maybe-transfer.js',
        {
            workerData: { buffer, transfer },
            // transferListプロパティに転送対象オブジェクトを指定
            transferList: transfer ? [buffer] : []
        }
    ).on('message', () =>
        // サブスレッドから値が戻ってくるまでにかかった時間を出力
        console.log(perf_hooks.performance.now() - start)
    )
    // サブスレッドに渡した値がどう見えるか確認
    console.log(buffer)
 }

 useMaybeTransfer(true)

 useMaybeTransfer(false)