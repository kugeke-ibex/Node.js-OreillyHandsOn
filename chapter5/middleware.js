// ミドルウェアは関数として実装される。
// 引数はリクエスト及びレスポンスオブジェクトと、後続のミドルウェアに処理を受け渡すnext関数を渡す。
// 全てのパス、HTTPメソッドのリクエストに対して
// ミドルウェアを適応
app.use(expressMiddleware)

// /api/todos以下の全てのパス、HTTPメソッドのリクエストに対して
// ミドルウェアを適応
app.use('/api/todos', expressMiddleware)


// app.get()やapp.post()には複数のハンドラを適応することが可能で、そのパス固有のものに加えて、汎用的なミドルウェア関数を指定できます。
app.get(
    '/api/todos',
    expressMiddleware, // 汎用的なミドルウェア関数
    (req, res) => { // 特定のパス、HTTPメソッドに対応するミドルウェア関数

    }
)

// Expressでは汎用的なものを「ミドルウェア」と指し、特定のパス、HTTPメソッドのリクエストに対応するミドルウェア関数をルートハンドラと呼びます。
// 通常のミドルウェアとは別に、エラーハンドリングを担うエラーハンドリングミドルウェアもあります。
// Expressではミドルウェアでnext()が引数(エラー)付きで呼び出されるか、同期処理がエラーを投げた時に、そのエラーを捕捉してエラーハンドリングミドルウェアで処理します。
app.use((req, req, next) => {
    if (!meetsRequirement(req)) {
        // 同期処理で発生したエラー
        next(new Error('不正なリクエスト'))
        // または
        // throw new Error('不正なリクエスト')
    }
    new Promise((resolve, reject) => {
        // ...
    }).catch(next) // 非同期処理で発生した
})

// Expressはデフォルトのエラーハンドリングミドルウェアを持っており、ほかにもエラーハンドリングミドルウェアがなければここでエラーハンドリングが行われます。
// 独自のエラーハンドリングを行いたい場合は、通常のミドルウェアやルートハンドラの後ろにエラーハンドリングミドルウェアを記述します。
// ミドルウェアは3つの引数を受け取るのに対して、エラーハンドリングミドルウェアは第一引数にエラーが追加された4つを引数に取ります。
app.use((err, req, res, next) => {
    // ...(エラーハンドリング)
    //  ステータスコードを設定してレスポンスを返す。
    res.status(500).json({ error: 'エラー'})
    // または後続のエラーハンドリングミドルウェアに処理を委譲する
    // next(err)
})
// next()で処理を委譲し続けた場合は、最終的にデフォルトのエラーハンドリングミドルウェアによってレスポンスが返されます。
// エラーハンドリング関数では、その全てを使うかどうかにかかわらず,4つの引数を宣言する必要があります。
// 関数の引数の数によって、通常のミドルウェア関数とエラーハンドリングミドルウェア関数と見分けています。

// 静的ファイルの配信
// Expressではexpressパッケージ本体に含まれるexpress.static()ミドルウェア関数を使って、静的ファイルの配信を簡単に実現できます。
app.use(express.static('public'))
// express.staticの引数には静的ファイルを格納したディレクトリを指定します。
/**
 * public
 * -------- index.html <- /index.html
 * |
 * |----|--- css
 * |    |____ style.css <- css/style.css
 * |----|--- img
 * |    |____ logo.png  <- img/logo.png
 * |____|___ js
 *      |____ main.js   <- js/main.js
 * 
 */

// 静的ファイルへのアクセスに対して任意のパスをプレフィックスとして指定することもできます。
app.use('/static', express.static('public'))
/**
 * public
 * -------- index.html <- /static/index.html
 * |
 * |----|--- css
 * |    |____ style.css <- /static/css/style.css
 * |----|--- img
 * |    |____ logo.png  <- /static/img/logo.png
 * |____|___ js
 *      |____ main.js   <- /static/js/main.js
 * 
 */

// リクエストボディのパース
// リクエストボディをパースするためのミドルウェアとして、expressパッケージにはexpress.json()とexpress.urlencoded()が用意されています。
// 前者はJSON形式のリクエストボディに、後者はHTMLフォームから送信される「キー=値」形式のリクエストボディにそれぞれ対応します。
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
// これらのミドルウェアを使うと、後続のミドルウェアではreq.bodyからパース結果をオブジェクトとして取得できます。
// express.urlencoded()の引数のextendedオプションはパースの際にnpmにあるqsパッケージを利用するか、Node.jsコアのqueryStringモジュールを使うかの指定するためのものです。
// trueの場合は前者、falseの場合は後者が使われます。
// querystringモジュールではネストされたデータ構造や配列に対応できないため、その場合はtrueを選択します。


// Cookieの取得
// ExpressでHTTPリクエストのCookieを取得するには、cookie-parseパッケージが提供するミドルウェアを利用します。
const cookieParser = require('cookie-parser')
app.use(cookieParser())
// パース結果はCookieの名前をプロパティ名としてその値にアクセスできるオブジェクトとして、req.cookiesにセットされます。


// HTTPサーバーが元のHTTPクライアントからのHTTPリクエストの情報を知ることができるように、プロキシはHTTPリクエストを中継する際に、
//　次に挙げる各ヘッダをリクエストに付与します。

// ・X-Forwarder-Host : 元のHTTPリクエストのHostヘッダ
// ・X-Forwarder-Proto : 元のHTTPリクエストのプロトコル
// ・X-Forwarder-For : 元のHTTPリクエストのアクセス元IPアドレス(複数のプロキシを経由する場合、カンマ区切りで後ろに値が追加されていく)

// Expressでこれらの情報を取得できるようにするには、trust proxyを有効にします。
app.enable('trust proxy')
// trust proxyを有効にするとリクエストオブジェクトの次のプロパティは各X-Forwarder-*ヘッダーの値を参照します。

// ・req.hostname : X-Forwarder-Hostヘッダー
// ・req.protocol : X-Forwarder-Protoヘッダー
// ・req.ip : X-Forwarder-Forヘッダーの一番最初の値
// ・req.ips : X-Forwarder-Forヘッダーのすべての値を配列にパースしたもの

// trust proxyが無効(デフォルト)な場合、HTTPサーバーに直接アクセスしたHTTPリクエストの情報を参照します。