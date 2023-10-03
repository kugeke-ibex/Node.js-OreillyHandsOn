// node --experimental-repl-await で実行する
// stream.Writable を継承
class DelayLogStream extends stream.Writable {
    constructor(options) {
        super({ objectMode: true, ...options })
    }

    _write(chunk, encoding, callback) {
        console.log('_write()')
        const { message, delay } = chunk
        setTimeout(() => {
            console.log(message)
            callback()
        }, delay)
    }
}

const delayStream = new DelayLogStream()

delayStream.write({message: 'Hi', delay: 0})

delayStream.write({message: 'Thank you', delay: 1000})

delayStream.write({message: 'Bye', delay: 100})