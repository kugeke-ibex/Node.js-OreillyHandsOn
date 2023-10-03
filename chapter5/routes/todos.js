'use strict'
// いくつかのモジュールに分けてルーティングを記述する場合はexpress.Router()を利用する
const express = require('express')
const router = express.Router()

router.route('/')
    .get((req, rest) => {
        // GETリクエストに対する処理を記述
    })
    .post((req, res) => {
        // POSTリクエストに対する処理を記述
    })

mudule.exports = router