'use strict'
const http = require('http')
const fibonacci = require('./fibonacci')

http.createServer((req, res) => {
    const n = Number(req.url.substr(1))
    if (Number.isNaN(n)) {
        return res.end()
    }
    const result = fibonacci(n)
    res.end(result.toString())
}).listen(3000)

// 並行度100で10秒間 http://localhost:300/30にアクセスする。
// npx loadtest -c 100 -t 10 http:localhost:3000/30