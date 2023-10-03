'use strict'
const express = require('express')
const { v4: uuidv4 } = require('uuid')
// const { v4 } = require('uuid')
// const uuidv4 = v4

// 実行されたスクリプトの名前に応じてデータストレージの実装を使い分ける
// process.env.npm_lifecycle_eventは、プログラムがpackage.jsonのscriptsに定義されたスクリプトから実行された場合に、
// そのスクリプト名が設定されます。 例. npm start => 'start'
const dataStorage = require(`./${process.env.npm_lifecycle_event}`)

const app = express()

app.use(express.json())

// ToDoの一覧の取得
app.get('/api/todos', (req, res, next) => {
    if (!req.query.completed) {
        return dataStorage.fetchAll().then(todos => res.json(todos), next)
    }
    const completed = req.query.completed === 'true'
    dataStorage.fetchByCompleted(completed).then(todos => res.json(todos), next)
})

// ToDoの新規登録
app.post('/api/todos', (req, res, next) => {
    const { title } = req.body
    if (typeof title !== 'string' || !title) {
        // titleがリクエストに含まれていない場合はステータスコード400(Bad Request)
        const err = new Error('title is required')
        err.statusCode = 400
        return next(err)
    }
    const todo = { id: uuidv4() /* UUIDの生成 */, title, completed: false }
    dataStorage.create(todo).then(() => res.status(201).json(todo), next)
})

/** Completedの設定、解除の共通処理 */
function completedHandler(completed) {
    return (req, res, next) => {
        dataStorage.update(req.params.id, { completed })
            .then(todo => {
                if (todo) {
                    return res.json(todo)
                }
                const err = new Error('ToDo not founct')
                err.statusCode = 404
                next(err)
            }, next)
    }
}

// ToDoのCompletedの設定、解除
app.route('/api/todos/:id/completed')
    .put(completedHandler(true))
    .delete(completedHandler(false))

// ToDoの削除
app.delete('/api/todos/:id', (req, res, next) => 
    dataStorage.remove(req.params.id).then(id => {
        if (id !== null) {
            return res.status(204).end()
        }
        const err = new Error('ToDo not found')
        err.statusCode = 404
        next(err)
    }, next)
)

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
    console.error(err)
    res.status(err.statusCode || 500).json({ error : err.message })
})

app.listen(3000)