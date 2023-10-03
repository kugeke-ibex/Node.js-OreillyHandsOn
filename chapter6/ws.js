'use strict'
const http = require('http')
const { json } = require('stream/consumers')
const WebSocket = require('ws')
// サーバサイド
// wsパッケージの中にWebSocketのサーバ向けの機能とクライアント向けの機能がありますが、
// 後者はNode.js環境でWebSocketのクライアントを実装するためのものです。
// ブラウザ環境ならばブラウザ標準のAPIを使います。
// wsのServerインスタンスはSocket.IOと同様http.Serverのインスタンスを引数に生成できますが、なしでも生成できます。

const server = http.createServer((req, res) => {
    // 通常のHTTPハンドリング
}).listen(3000)

// Serverインスタンス生成
const ws = new WebSocket.Server({ server })

// または、http.Serverインスタンスを使わす直接生成
// const ws = new WebSocket.Server({ port: 3000 })
// Serverインスタンス(ws)もEventEmitterですが、クライアントとデータをやり取りするAPIはブラウザのWebSocketAPIに近い。
// emit()ではなく、send()を利用し、データを受信するときはmessageという決まった名前のイベントを使う。

// 新しいクライアントからの接続に伴うconnectionイベント
ws.on('connection', socket => {
    // クライアントにデータを送信
    socket.send('Hello')

    // クライアントからデータを受信
    socket.on('message', name => {
        // 接続している全クライアントにイベントを送信
        ws.clients.forEach(client => {
            // 接続がオープンが確認する。
            if (client.readyState === WebSocket.OPEN) {
                client.send(`${name} joined`)
            }
        })
        // または、このSocketインスタんを介して接続しているクライアント以外の
        // 全クライアントにイベントを送信
        // ws.client.forEach(client => {
        //     if (client !== socket && client.readyState === WebSocket.OPEN) {
        //         client.send(`${name} joined`)
        //     }
        // })
    })
})

// wsはSocket.IOの名前空間、ルーム、ミドルウェアのようなリッチな機能は用意されていません。
// 認証を行いたい場合は、ServerのコンストラクタのverifyClientオプションに認証のための関数を指定します。

const ws2 = new WebSocket.Server({
    verifyClient: ({
        origin, // クライアントのオリジン
        req,    // リクエストオブジェクト(req.headers.でヘッダ情報を参照可能)
        secure  // セキュアかどうか(wssプロトコルでの接続かどうか)
    }) => {
        // 接続を許可するかどうかをbooleanで返す
        return true
    },
    // 認証を非同期に行う場合は、verifyClientの第二引数にコールバックを取る
    // verifyClient: (info, cb) => {
    //     cb(true)
    // }
    server
})

// クライアントサイド
// ブラウザからアクセスするには、WebSocketコンストラクタを使って接続を開始する
// 接続の完了はopenイベント、サーバーからのメッセージ受信はmessageイベントにリスナを設定して検知できます。

// WebSocket接続の作成
const socket = new WebSocket('ws://localhost:3000')

// 接続完了のリスナを設定
socket.addEventListener('open', () => {
    // ・・・
})

// メッセージ受信のリスナを設定
socket.addEventListener('message', message => {
    // サーバーでsend()の引数に渡したものはmessage.dataから取得できる
    const data = message.data
    // ・・・
})

// サーバーへのメッセージ送信はsend()を使います。接続状態がOPENになっていない時にsend()を実行するとエラーになります。
// また、接続を閉じるときはclose()を使います。

// サーバーにメッセージを送信する
// 必要に応じて、状態がOPENになっているかどうかを確認する
// または、openイベントリスナの中で実行する
if (socket.readyState === WebSocket.OPEN) {
    socket.send('Taro')
}

// 接続を閉じる
socket.close()

// Socket.IOのようにJavaScriptのオブジェクトをそのままやり取りすることはできません。
// 送信側
socket.send(JSON.stringify({ foo: 1 }))

// 受信側
// サーバーサイドの場合
socket.on('message', message => {
    const data = JSON.parse(message)
})

// クライアントサイドの場合
socket.addEventListener('message', message => {
    const data = JSON.parse(message.data)
})