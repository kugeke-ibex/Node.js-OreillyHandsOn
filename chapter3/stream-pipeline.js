// pipe()はエラーを伝播しない
fs.createReadStream('no-such-file.txt')
    .pipe(fs.createWriteStream('dest.txt'))
    .on('error', err => console.log('エラーイベント', err.message))

// 読み込みストリームに直接errorイベントリスナを登録する
fs.createReadStream('no-such-file.txt')
   .on('error', err => console.log('エラーイベント', err.message))
   .pipe(fs.createWriteStream('dest.txt'))
   .on('error', err => console.log('エラーイベント', err.message))


// stream.pipeline()は2つ以上のストリームを引数に取り、それらをpipe()で連結する。
// 連結したストリームのどこかでエラーが発生すると、最後のコールバックがそのエラーを引数に実行される。
// エラーがない時はコールバックは引数なしで実行される。
// 必ず全てのストリームは自動的に破棄される。
stream.pipeline(
    fs.createReadStream('no-such-file.txt'),
    fs.createWriteStream('dest.txt'),
    err => err
        ? console.log('エラー発生', err.message)
        : console.log('正常終了')
)

// util.promisify()によるPromise化が可能.
// node --experimental-repl-await
try {
    await util.promisify(stream.pipeline)(
        fs.createReadStream('no-such-file.txt'),
        fs.createWriteStream('dest.txt')
    )
    console.log('正常終了')
} catch (err) {
    console.log('エラー発生', err.message)
}