// コールバックはend,finish,errorイベントなしでストリームが終了した場合にも呼ばれる。
stream.finished(
    // dataイベントリスナを登録してフローイングモードにする
    fs.createReadStream('src.txt').on('data', () => {}),
    err => err ? console.error(err.message) : console.log('正常終了')
)

// stream.finished()もutil.promisify()でPromise化できます。
// await util.promisify(stream.finished)(
//     fs.createReadStream('src.txt').on('data', () => {})
// .then(() => console.log('正常終了'), err => console.error(err.message))