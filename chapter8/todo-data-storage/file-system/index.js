'use strict'
const { exname, extname, basename } = require('path')
const {readdir, readFile, writeFile, unlink } = require('fs').promises

exports.fetchAll = async () => {
    // 同一ディレクトリ内に存在するJSONファイルをすべて取得
    const files = (await readdir(__dirname))
        .filter(file => extname(file) === '.json')
    return Promise.all(
        files.map(file => 
            readFile(`${__dirname}/${file}`, 'utf8').then(JSON.parse)
        )
    )
}

exports.fetchByCompleted = completed => exports.fetchAll()
    .then(all => all.filter(todo => todo.completed === completed))

exports.create = todo => writeFile(`${__dirname}/${todo.id}.json`, JSON.stringify(todo))

exports.update = async (id, update) => {
    const fileName = `${__dirname}/${id}.json`
    return readFile(fileName, 'utf8').then(
        content => {
            const todo = {
                ...JSON.parse(content),
                ...update
            }
            return writeFile(fileName, JSON.stringify(todo)).then(() => todo)
        },
        // ファイルが存在しない場合はnullを返し、それ以外はそのままエラーにする
        err => err.code === 'ENOENT' ? null : Promise.reject(err)  
    )
}

exports.remove = id => unlink(`${__dirname}/${id}.json`)
    .then(
        () => id,
        // ファイルが存在しない場合はnullを返し、それ以外はエラーにする
        err => err.code === 'ENOENT' ? null : Promise.reject(err)
    )


// node --experimental-repl-await
// require('isomorphic-fetch')
// const baseUrl = 'http://localhost:3000/api/todos'
// await fetch(baseUrl)
// console.log(_.status, await _.json())

// for (const title of ['ネーム', '下書き']) {
//     const res = await fetch(baseUrl, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ title })
//     })
//     console.log(res.status, await res.json())
// }

// (await fetch(baseUrl, {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json'
//     },
//     body: '{}'
// })).status

// await fetch(baseUrl).then(res => res.json())

// await fetch(`${baseUrl}/${_[0].id}/completed`, { method: 'PUT'})
// console.log(_.status, await _.json())
// (await fetch(`${baseUrl}/foo/completed`, { method: 'PUT'})).status

// await fetch(baseUrl).then(res => res.json())

// await fetch(`${baseUrl}/${_[0].id}/completed`, { method: 'DELETE'})
// console.log(_.status, await _.json())
// (await fetch(`${baseUrl}/foo/completed`, { method: 'DELETE'})).status

// await fetch(baseUrl).then(res => res.json())

// (await fetch(`${baseUrl}/${_[0].id}/`, { method: 'DELETE'})).status
// (await fetch(`${baseUrl}/foo/`, { method: 'DELETE'})).status

// await fetch(baseUrl).then(res => res.json())


