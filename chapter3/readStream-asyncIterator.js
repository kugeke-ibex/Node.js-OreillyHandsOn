const helloReadableStream1 = new HelloReadableStream()
    .on('end', () => console.log('完了'))
for await (const data of helloReadableStream1) {
    console.log('data', data.toString())
}

const helloReadableStream2 = new HelloReadableStream({highWaterMark: 0})
    .on('end', () => console.log('完了'))
for await (const data of helloReadableStream2) {
    await new Promise(resolve => setTimeout(resolve, 100))
    console.log('data', data.toString())
}

// stream.Readable.from()で任意のasyncイテラブルから読み込みストリームを作れる.

async function* asyncGenerator() {
    let i = 0;
    while (i <= 3) {
        await new Promise(resolve => setTimeout(resolve, 100))
        yield `${i++}`
    }
}

const asyncIterable = asyncGenerator()

const readableFromAsyncIterable = stream.Readable.from(asyncIterable)

readableFromAsyncIterable.on('data', console.log)

// asyncでない通常のイテラブル(配列)からでも読み込みストリームは作成可能
// stream.pipeline()の引数に渡す際はstream.Readlble.from()をつかなくても
// イテラブルやasyncイテラブルをそのまま渡せます。
util.promisify(stream.pipeline)(
    asyncGenerator(),
    fs.createWriteStream('dest.txt')
)