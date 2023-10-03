// サーバーサイド
'use strict'
const http = require('http')
const Server = require('socket.io')

const server = http.createServer((req, res) => {
    // 通常のHTTPリクエストハンドリング
}).listen(3000)

// Serverインスタンスを生成
const io = Server(server)

// オプションを指定する場合(ここでは接続を許可するオリジンを指定)
// const io = Server(server, { origins: allowed.origin.com })
// 生成されたServerインスタンスはEventEmitterであり、クライアントとのでーたのやりとりはイベントを介して行われます。

// 新しいクライアントからの接続に伴うconnectionイベント
io.on('connection', socket => {
    // 任意のイベント名でクライアントにデータを送信
    socket.emit('greeting', 'Hello')
    // 任意のイベント名でクライアントからデータを受信
    socket.on('registerName', name => {
        // 接続している全クライアントに任意のイベント名でデータを送信
        io.emit('notifyNewComer', `${name} joined`)
        // または、このSocketインスタンスを介して接続しているクライアント以外の
        // 全クライアントにデータを送信
        // socket.broadcast.emit('notifyNewComer', `${name} joined`)
    })
})

// connectionイベントのペイロードとして与えられるSocketインスタンス(socket)を介して、個別のクライアントと通信できます。
// サーバーと接続中の全クライアントにデータを送信したい場合は、ioのイベントを使います。
// socket.broadcastを使って、そのsocketを介して接続しているクライアント以外の全クライアントにデータを送信することも可能です。

// Socket.IOの名前空間の機能を使うと、クライアントが接続してきた名前空間ごとに異なる処理を実装できます。
// １つのクライアントが複数の名前空間にアクセスしても、リソースを節約するためサーバーとのせつ族自体は1つのものを共有する作りになっています。
// デフォルトの名前空間は「/」です。io.of()によって任意の名前空間を指定し、その中でクライアントとのやりとりを実装できます。

io.of('/namespace1').on('connection', socket => {
    // この名前空間に接続する全クライアントにデータを送信
    io.of('/namespace1').emit('someEvent', 'foo')
})

// それぞれの名前空間の中でさらに、ルームと呼ばれるコミュニケーションのスコープを定義できます。
// サーバーサイドではsocketのjoin()、leave()メソッドにより、それぞれのsocketを特定のルームに入れたり出したりできます。

io.on('connection', socket => {
    // socketをroomAに入れる
    socket.join('roomA')
    // roomAに存在するsocketのみにデータを送信
    io.to('roomA').emit('someEvent', 'foo')
    // socketをroomAから出す
    socket.leave('roomA')
})

// Socket.IOにはExpressと同様なミドルウェアの概念があります。
// socket生成に際して適応する場合はio.use()、socketを介したクライアントからの通信に際して適応する場合はsocket.use()を使います。
// 例えばio.use()に対し、socket.requestから取得できる通信開始時のリクエスト情報に基いて認証や認可を行うミドルウェアを登録することも可能です。

io.use((socket, next) => {
    // socketが生成されるたびに実行される
    // 認証を行う例
    if (isLogin(socket.request.headers)) {
        next()
    } else {
        next(new Error('Need Login'))
    }
})

io.of('/namespace1').use((socket, next) => {
    // 特定の名前空間に対してミドルウェアを登録する
})

io.on('connection', socket => {
    socket.use((packet, next) => {
        // クライアントからの通信のたびに実行される
    })
})
// 第二引数にはnext()を渡し、ミドルウェアに処理を渡す場合は引数なしで実行し、エラーが発生した場合はエラーを引数に実行します。

// クライアントサイド
// クライアントサイトでは、次のようにio()でサーバーへの接続を開始する
import io from 'socket.io-client'

const socket = io()
// 接続オブションを指定する場合(ここでは切断時に再接続しないよう設定)
// const socket = io({ reconnection: false }) 

// サーバーが別ドメインの場合
// const socket = io('https://socket.io-server.com')

// 特定の名前空間に接続する場合
// const socket = io('/namespace1')

// 上記パターンの組み合わせ
// const socket = io(
//     'https://socket.io-server.com/namespace1',
//     { reconnection: false }
// )

// サーバとの通信は、クライアントサイドでもEventEmitterのインターフェースによって行います。

// 任意のイベント名でサーバーにデータを送信
socket.emit('registerName', userName)

// 任意のイベント名でサーバからデータを受信
socket.on('notifyNewComer', message => {
    console.log(message)
})