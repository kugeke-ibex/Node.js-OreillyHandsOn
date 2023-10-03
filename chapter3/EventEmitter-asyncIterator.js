const eventAEmitter = new events.EventEmitter()

const eventAIterable = events.on(eventAEmitter, 'eventA')

(async () => {
    for await (const a of eventAIterable) {
        if (a[0] === 'end') {
            break
        }
        console.log('eventA', a)
    }
})()

eventAEmitter.emit('eventA', 'Hello')
eventAEmitter.emit('eventA', 'Hello', 'world')
eventAEmitter.emit('eventA', 'end')