const todos = [
    { id: 1, title: 'ネーム', completed: false },
    { id: 2, title: '下書き', completed: true },
]

// httpモジュールのcreateServerメソッドによりサーバーを起動し、コールバック関数の中でリクエストをハンドリングします。
// コールバック関数はそれぞれリクエストとレスポンスを表す二つの引数をとり、前者は読み込みストリーム、後者は書き込みストリーム。
// listen()の戻り値はサーバーインスタンスそのもの。
const server = http.createServer((req, res) => {
    if (req.url === '/api/todos') {
        if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json')
            // 書き込みストリームのend()でレスポンスに書き込みを行っている。
            return res.end(JSON.stringify(todos))
        }
        res.statusCode = 405
    } else {
        res.statusCode = 404
    }
    res.end()
}).listen(3000)

// HTTPリクエストを送信するにはhttpモジュールのrequest()を利用する
// 第一引数にはURL、第二引数にレスポンスのハンドラを指定する。
// request()は書き込みストリームであるhttp.ClientRequestオブジェクトを返す.
// request()を実行しただけではHTTPリクエストは送信されず、httpClientRequestオブジェクトのend()を実行したタイミングで送信されます。
// レスポンスハンドラの第一引数として与えられるレスポンスオブジェクトは読み込みストリームです。
// dataイベントからデータを受け取って結果を蓄積し、endイベントのタイミングで出力します。
http.request('http://localhost:3000/api/todos', res => {
    let responseData = ''
    console.log('statusCode', res.statusCode)
    res.on('data', chunk => responseData += chunk)
    res.on('end', () => console.log('responseData', JSON.parse(responseData)))
}).end()

// 
http.request(
    'http://localhost:3000/api/todos',
    { method: 'POST' },
    res => console.log('statusCode', res.statusCode)
).end()

http.request(
    'http://localhost:3000/api/foo',
    res => console.log('statusCode', res.statusCode)
).end()

