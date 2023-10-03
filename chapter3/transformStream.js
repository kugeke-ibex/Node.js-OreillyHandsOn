// node --experimental-repl-await で実行する
// stream.Transform を継承
// _transformの引数は_writeと同じだが、内部処理で_read()と同様push()を実行している。
// _flush()は上流からデータが流し終わったタイミングで実行される。引数はコールバック
class LineTransformStream extends stream.Transform {
    remaining = ''
    constructor(options) {
        super({ readableObjectMode: true, ...options })
    }

    _transform(chunk, encoding, callback) {
        console.log('_transform()')
        const lines = (chunk + this.remaining).split(/\n/)
        this.remaining = lines.pop()
        for (const line of lines) {
            this.push({ message: line, delay: line.length * 100 })
        }
        callback()
   }

    _flush(callback) {
        console.log('_flush()')
        this.push({
            message: this.remaining,
            delay: this.remaining.length * 100
        })
        callback()
    }
   
    // _flush(callback) {
    //     callback(
    //         null, // 第一引数は(エラー)null
    //         {message: this.remaining, delay: this.remaining.length * 100}
    //     )
    // }
}

const lineTransformStream = new LineTransformStream()
lineTransformStream.on('readable', () => {
    let chunk
    while ((chunk = lineTransformStream.read()) !== null) {
        console.log(chunk)
    }
})

lineTransformStream.write('foo\nbar')

lineTransformStream.write('baz')

lineTransformStream.end()