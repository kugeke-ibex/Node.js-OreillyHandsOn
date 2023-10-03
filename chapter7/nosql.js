// NoSQLの分類
// ・KVS(Key-Value Store) : ユニークなキーと値のペアという形式データを保持。単純な構造のデータベース。データはメモリまたはディスクに保存される
// ・ドキュメントストア : ユニークなキーに対し、XMLやJSONなどの形式でデータ(ドキュメント)を保持するデータベース。
//                     一部のドキュメントストではリレーショナルデータベースにおけるテーブルに似たコレクションと呼ばれる単位でドキュメントが
//                     グルーピングされる。ただ、1つのコレクションに属するドキュメントの構造は必ずしも一致しない。
//                     データにはキーを指定してアクセスするほか、ドキュメントの内容に基づく検索も可能です。
// ・ワイドカラムストア : 行と列からなるテーブルにデータを保存する点でリレーショナルデータベースに似ています。
//                     ワイドカラムストアは異なる列を保存でき、かつ非常に多くの数の列を持てます。2次元のKVSともみなせます。
//                     データが行や列によってグループ化され、それぞに対して独立してアクセス、処理が可能な為大規模なデータを扱うのに向いています。
// ・グラフデータベース : グラフ構造に基づくデータの取得や保存を行えるデータベースです。グラフ構造は多数のノードとそれらを繋ぐエッジによって表現された構造です。

// LevelDBはKVは形式で、データをディスクに保存します。Webブラウザ上のJavaScriptから利用可能なKVSとして、IndexedDBという標準APIがありますが、
// Google ChromeのIndexedDBはLevelDBを使って実装されています。

// node --experimental-repl-await
const { Level } = require('level')
// const db = level('leveldb')
// const db = new level('leveldb', { valueEncoding: 'json' })
const db = new Level('leveldb')

// データの保存
// db.put()を利用する。第一引数にはキー、第二引数には値を指定。
// 最後の引数としてコールバックを指定できるが、指定なしだとPromiseインスタンスが返されます。
// db.put()以外も同様な引数指定になっています。
const todo1 = JSON.stringify({ id: '1', title: '表紙', completed: false })
// キーにはIDだけでなく名前空間のようなものをつけたほうが良い。
await db.put('todo:1', todo1)

// データの取得
çç
// 存在しないキーを指定した場合は、エラーになります。エラーのnotFoundプロパティにそのキーが存在しないかどうか識別できます。
await db.get('todo:2')
_error.notFound

for await (const data of db.createReadStream()) {
    console.log(data.key, data.value)
}

':'.charCodeAt(0)

String.fromCharCode(_ + 1)

for await (const data of db.createReadStream({gt: 'todo:', lt: 'todo;'})) {
    console.log(data.key, data.value)
}

// データの削除
await db.del('todo:1')
await db.get('todo:1')
// db.get()とは違い、存在しないキーを指定してもエラーにはなりません。
await db.del('todo:1')

// データの更新
// db.batch()により、データベースに対する複数の更新処理が実行できます。
// 一でも更新処理に失敗すると他全ての更新処理も破棄されます。
// typeプロパティが'put'の場合、keyプロパティをキー、valueプロパティを値として保存します。
// typeプロパティが'del'の場合、keyプロパティのキーを削除します。

await db.batch([
    { type: 'put', key: 'city:2021', value: '東京'},
    { type: 'put', key: 'city:2016', value: 'リオ'},
    { type: 'put', key: 'city:2012', value: 'ロンドン'},
    { type: 'del', key: 'city:2021'}
])

for await (const data of db.createReadStream({gt: 'city:', lt: 'city;'})) {
    console.log(data.key, data.value)
}

// put()、del()はbatchオブジェクト自体を返し、write()はPromiseインスタンスを返します。
await db.batch()
    .put('city:2008', '北京')
    .put('city:2004', 'アテネ')
    .put('city:2000', 'シドニー')
    .del('city:2016')
    .write()

for await (const data of db.createReadStream({gt: 'city:', lt: 'city;'})) {
    console.log(data.key, data.value)
}

// db.close()でdbインスタンスをクローズします。
await db.close()

// 値にる検索を実現するために作成する索引(インデックス)をセカンダリーインデックスと呼ぶ。
// NoSQLの中にはセカンダリインデックスを標準機能としてサポートするものがありますが、
// LevelDBにはそのような機能がないので、自作する必要があります。