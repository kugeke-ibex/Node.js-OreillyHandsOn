// _read()は_transform()によってデータが処理されるまで再び呼び出されない。
// _transform()も後続の_write()の実行を待ってから呼ばれる。
// pipe()の戻り値は引数の読み込みストリーム？
new HelloReadableStream({ highWaterMark: 0})
    .pipe(new LineTransformStream({
        writableHighWaterMark: 0,
        readableHighWaterMark: 0,
    }))
    .pipe(new DelayLogStream({ highWaterMark: 0}))
    .on('finish', () => console.log('完了'))

const ltStream = new LineTransformStream()

ltStream === new HelloReadableStream().pipe(ltStream)

// 単一の読み込みストリームに対してpipe()を複数回実行すると、ストリームを分岐されられます。
const srcReadStream = fs.createReadStream('src.txt')

srcReadStream
   .pipe(fs.createWriteStream('dest,txt'))
   .on('finish', () => console.log('分岐1完了'))

srcReadStream
   .pipe(crypto.createHash('sha256'))
   .pipe(fs.createWriteStream('dest.crypto.txt'))
   .on('finish', () => console.log('分岐2完了'))