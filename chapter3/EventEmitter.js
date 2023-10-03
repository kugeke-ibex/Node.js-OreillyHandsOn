// events.EventEmitter を継承
class FizzBuzzEventEmitter extends events.EventEmitter {
    async start(until) {
        this.emit('start')
        let count = 1
        while (true) {
            if (count % 15 === 0) {
                this.emit('FizzBuzz', count)
            } else if (count % 3 === 0) {
                this.emit('Fizz', count)
            } else if (count % 5 === 0) {
                this.emit('Buzz', count)
            }
            count += 1
            if (count >= until) {
                break
            }

            await new Promise(resolve => setTimeout(resolve, 100))
        }
        this.emit('end')
    }
}

new FizzBuzzEventEmitter()
    .on('start', startListener)
    .on('Fizz', fizzListener)
    .on('Buzz', buzzListener)
    .on('FizzBuzz', fizzBuzzListener)
    .on('end', endListener)
    .start(20)