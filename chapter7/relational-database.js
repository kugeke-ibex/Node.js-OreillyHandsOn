// node --exprimental-repl-awaitで実行
// 詳細なログを出力するにはverbose()を使って、冗長モードにセットし、データベースオブジェクトを作成する。
const sqlite3 = require('sqlite3').verbose()
// メモリ上にデータを保持する設定でデータベースオブジェクトを作成
const db = new sqlite3.Database(':memory:')

// テーブルを作成するにはデータベースオブジェクトのrun()の引数にCREATE文を渡します。
// sqlite3では非同期処理がコールバックパターンで実装されているため、使いやすいように利用するメソッドを
// あらかじめutil.promisify()でPromiseインスタンスを返すように変換します。
const dbRun = util.promisify(db.run.bind(db))

await dbRun(`CREATE TABLE todo (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL
)`)

// なぜ、util.promisify(dbu.run)ではなくutil.promisify(db.run.bind(db))なのか？
// db.run()をそのまま実行するとこのメソッドの中でdbがthisとして扱われます。
// 一方でutil.promisify(db.run)のような書き方だと、db.runが一度変数(util.promisifyの引数)に割り当てられます。
// 変数に割り当てられたdb.runを関数として実行うると、その中ではthisがundefinedになってしまいます。

class MyClass {
    method1() {
        console.log('method1')
    }
    method2() {
        this.method1()
    }
}

const myInstance = new MyClass()

myInstance.method1()

myInstance.method2()

// myInstance.method1とmyInstance.method2をそれぞれ変数に割り当てて実行すると、エラーになります。

const myInstanceMethod1 = myInstance.method1

myInstanceMethod1()

const myInstanceMethod2 = myInstance.method2

myInstanceMethod2()

// myInstanceMethod2()ではthis.method1()を実行する際にthisがundefinedになってしまいます。
// この事態を回避するために使われるのが、bind()です。
// bind()はFunction.prototypeに含まれるメソッドであり、JavaScriptのあらゆる関数がこのメソッドを持ちます。
Function.prototype.bind

// このメソッドを。その関数の中でthisや引数として使う値を指定して実行すると、それらの値がバインドされた新しい関数を返します。
// 引数をバインドした場合、新しい関数ではその分引数の数が少なくなります。

function add(a, b) {
    return (Number(this) || 0) + a + b
}

// 直接実行
add(1, 2)
// 何も指定せずにbind()した関数を実行
add.bind()(1, 2)
// thisが1になるようbind()した関数を実行
add.bind(1)(1, 2)
// thisが1、第一引数が2になるようbind()した関数を実行
add.bind(1, 2)(2)
// thisが1、第一引数が2、第二引数が3になるようbind()した関数を実行
add.bind(1, 2, 3)()

add.length
// thisと第一引数をバインドした関数は引数の数が1
add.bind(1, 2).length

// bind()でthisをバインドし、エラーにならずに関数を実行できます。
myInstanceMethod2.bind(myInstance)()

// 元のthisとは別のものをbind()に渡すことも可能です
const anotherThis = { method1: () => console.log('anothoer method1')}
myInstanceMethod2.bind(anotherThis)()

//　データの作成
await dbRun(`INSERT INTO todo VALUES ('1', 'ネーム', false)`)

// 静的プレースホルダ(プリペアドステートメント)の作成
const statement = db.prepare('INSERT INTO todo VALUES (?, ?, ?)')

// 静的プレースホルダの実行
await util.promisify(statement.run.bind(statement))('2', '下書き', false)

// 動的プレースホルダ
await dbRun('INSERT INTO todo VALUES (?, ?, ?)', '3', 'ペン入れ', false)

// パラメータを配列で渡すことも可能(静的、動的ともに)
await dbRun('INSERT INTO todo VALUES (?, ?, ?)', ['4', '仕上げ', false])

// db.prepare()はsqlite3.Statementクラスのインスタンスを返しますが、このクラスはsqlite3.Databaseクラスと概ね
// 同じインターフェイスを持ちます。run()以外でもget()やall()などのメソッドも利用できます。

// プレースホルダには名前をつけられ、その名前はパラメータを指定する際にも利用できます。
await dbRun(
    'INSERT INTO todo VALUES ($id, $title, $completed)',
    { $id: '5', $title: '出稿', $completed: false }
    )

// データの取得
// 取得したい件数が1件のみならば、get()で複数取得したい場合はall()を利用します。
const dbAll = util.promisify(db.all.bind(db))

await dbAll('SELECT * FROM todo')

await dbAll('SELECT id, title FROM todo')

await dbAll(`SELECT * FROM todo WHERE id = '2'`)

const dbGet = util.promisify(db.get.bind(db))

await dbGet('SELECT * FROM todo WHERE id = ?', '5')

// データの更新
await dbRun('UPDATE todo SET completed = true')
// await dbAll('SELECT * FROM todo')

await dbRun('UPDATE todo SET completed = ? WHERE id = ?', false, '4')
// await dbAll('SELECT * FROM todo')
// UPDATE分はWHERE句に該当する行が存在しなくてもエラーを返しません。
await dbRun('UPDATE todo SET completed = ? WHERE id = ?', false, '100')
// db.run()では、コールバック関数の中のthisのchangesプロパティで更新された行の数を参照できるようになっています。
db.run(
    'UPDATE todo SET completed = ? WHERE id = ?',
    false,
    '100',
    function () {
        console.log(this)
    }
)

// Database {}
// > Statement { lastID: 5, changes: 0 }

const dbRun2 = function () {
    return new Promise((resolve, reject) => 
        db.run.apply(db, [
            ...arguments,
            function(err) {
                err ? reject(err) : resolve(this)
            }
        ])
    )
}
// argumentsはfunction () {}の形で実装された関数の中で、関数の引数を配列のようなオブジェクトとして
// 参照するための変数です。アロー関数ではargumentsが使えないです。
// 上記の場合だと、argumentsは(resolve, reject) => {}の中にありますが、
// 外側のfunction() {}の引数を参照します。
// db.run.apply()はFunction.prototype.apply()であり、関数の引数に配列を割り当てるのに便利です。

function add(a, b) {
    return (Number(this) || 0) + a + b
}

add.apply(1, [2, 3])
// Function.protype.bind()と同様、Function.prototype.apply()の第一引数には関数の中でthisとして使われます。
// 第二引数でその関数の引数を配列として指定できるため、本来はadd(a, b)のようなスタイルで実行すべき関数を、配列を使って実行できます。
// dbRun2()では、db.run.apply()の大引数としてdbRun2()自体の引数(arguments)の末尾にコールバック関数を追加したものを指定して実行し、
// 処理成功時に戻り値のPromiseインスタンスがコールバック関数のthisで解決されるようにしています。

await dbRun2('UPDATE todo SET completed = ? WHERE id = ?', false, '100')
// DELETE文も同様に存在しない場合はエラーを返さないので、dbRun2()で実行する。
await dbRun2('DELETE FROM todo WHERE id = ?', '11')
await dbRun2('DELETE FROM todo')

// トランザクションの制御
// sqlite3では、トランザクションは利用者が直接SQL文を書いて制御する必要があります。

async function createTodos(todos) {
    await dbRun('BEGIN TRANSACTION')
    try {
        for (const todo of todos) {
            await dbRun(
                'INSERT INTO todo VALUES (?, ?, ?)',
                todo.id,
                todo.title,
                todo.completed
            )
        }
    } catch (err) {
        console.error(err)
        // エラーがあった場合はロールバック
        return dbRun('ROLLBACK TRANSACTION')
    }
    // 全件の登録に成功したらコミット
    return dbRun('COMMIT TRANSACTION')
}

await createTodos([
    {id: '1', title: 'ネーム', completed: false},
    {id: '2', title: '下書き', completed: false}
])

// await dbAll('SELECT * FROM todo')

await createTodos([
    {id: '3', title: 'ペン入れ', completed: false},
    {id: '4', title: null, completed: false},
    {id: '5', title: '出稿', completed: false}
])