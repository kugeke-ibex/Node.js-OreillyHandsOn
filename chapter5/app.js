'use strict'
const express = require('express')
const app = express()

// /api/todos以下のパスに対するリクエストのハンドリングを
// ./routes/todosモジュールに移譲
app.use('/api/todos', require('./routes/todos'))

app.listen(3000)

// URLのパラメーターの正規表現チェック
app.get('/api/todos/:id(\\d+)', (req, res) => {
    const todoId = Number(req,params.id)
})

// クエリ文字列の取得はhttpモジュールを使うときは、グローバルのURLAPIを使ってURLをパースします。
new URL('/api/todos?completed=true', 'http://localhost:3000')
_.searchParams.get('completed')

// 一方、Expressでは特別な処理をしなくてもreq.queryオブジェクトから取得できます。
app.get('/api/todos', (req, res) => {
    const completedFilter = req.query.completed
})