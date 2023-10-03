const events = require('events')

try {
    new events.EventEmitter()
        .emit('error', new Error('エラー'))
} catch (err) {
    console.log('catch')
}