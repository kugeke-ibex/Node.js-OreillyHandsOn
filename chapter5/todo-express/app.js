'use strict'
const express = require('express')
let todos = [
    { id: 1, title: 'ネーム', completed: false},
    { id: 2, title: '下書き', completed: true}
]
const app = express()

app.use(express.json()) // 追加

// ToDo一覧の取得
app.get('/api/todos', (req, res) => {
    if (!req.query.completed) {
        return res.json(todos)
    }
    // completedクエリパラメーターを指定された場合はToDoをフィルタリング
    const completed = req.query.completed === 'true'
    res.json(todos.filter(todo => todo.completed === completed))
})

// ToDoのIDの値を管理するための変数
let id = 2
// ToDoの新規登録
app.post('/api/todos', (req, res, next) => {
    const { title } = req.body
    if (typeof title !== 'string' || !title) {
        // titleがリクエストに含まれない場合はステータスコード400(Bad Request)
        const err = new Error('title is required')
        err.statusCode = 400
        return next(err)
    }
    // ToDoの作成
    const todo = { id: id += 1, title, completed: false}
    todos.push(todo)
    // ステータスコード201(Created)で結果を返す
    res.status(201).json(todo)
})

// エラーハンドリングの手前に、記述
// 指定されたIDのTodoを取得するためのミドルウェア
app.use('/api/todos/:id(\\d+)', (req, res, next) => {
    const targetId = Number(req.params.id)
    const todo = todos.find(todo => todo.id === targetId)
    if (!todo) {
        const err = new Error('ToDo not founc')
        err.statusCode = 404
        return next(err)
    }

    req.todo = todo
    next()
})

// 上記のミドルウェアの後に記述
// ToDoのCompletedの設定、解除
app.route('/api/todos/:id(\\d+)/completed')
    .put((req, res) => {
        req.todo.completed = true
        res.json(req.todo)
    })
    .delete((req, res) => {
        req.todo.completed = false
        res.json(req.todo)
    })

// ToDoの削除
app.delete('/api/todos/:id(\\d+)', (req, res) => {
    todos = todos.filter(todo => todo !== req.todo)
    res.status(204).end()
    // 中身を指定せずにend()でレスポンスを完了することで空のレスポンスを返します。
    // res.status(204).json()でも同じ結果だが、end()の方が完了する意図が伝わりやすい
})

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
    console.log(err)
    res.status(err.statusCode || 500).json({ error: err.message})
}) 

app.listen(3000)

// Next.jsによるルーティングのためこれ以降を追記
const next = require('next')
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })

nextApp.prepare().then(
    // pagesディレクトリ内のReactコンポーネントに対するサーバーサイドルーティング
    () => app.get('*', nextApp.getRequestHandler()),
    err => {
        console.error(err)
        process.exit(1)
    }
)


// httpモジュールの代わりにisomorphic-fetchを使う。
// HTTPリクエストを送信するためのWeb標準のフェッチAPIを、Node.js環境及びブラウザ環境でポリフィルするもの。
// ポリフィルとはあるAPIをネイティブにサポートしていない環境において、グローバルに手を加えてそれがサポートされている環境に模倣すること。
// await fetch ('http://localhost:3000/api/todos')
// console.log(_.status, await _.json())
// await fetch('http://localhost:3000/api/foo')
// console.log(_.status, await _.text())
// レスポンスは対応するルートハンドラがない時にExpressが自動的に返すもので、JSON形式になっていません。

// fetch()の第二引数にJavaScriptオブジェクトを渡し、その中にHTTPメソッドやリクエストボディ、リクエストヘッダーの指定ができます。
// await fetch('http://localhost:3000/api/todos', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ title: 'ぺん入れ' })
// })


// 練習問題
// require('isomorphic-fetch')
// const baseUrl = 'http://localhost:3000/api/todos'
// await fetch(baseUrl)
// console.log(_.status, await _.json())
// await fetch(`${baseUrl}/1/completed`, { method: 'PUT' })
// console.log(_.status, await _.json())
// await fetch(baseUrl).then(res => res.json())
// await fetch (`${baseUrl}/2/completed`, { method: 'DELETE' })
// console.log(_.status, await _.json())
// await fetch(`${baseUrl}/1`, { method: 'DELETE' }).then(res => res.status)
// await fetch(baseUrl).then(res => res.json())