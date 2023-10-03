const eventBEmitter = new events.EventEmitter()

const eventBPromise = events.once(eventBEmitter, 'eventB')

eventBPromise.then(arg => console.log('eventB発生', arg))

eventBEmitter.emit('eventB', 'Hello', 'world')