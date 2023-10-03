// デフォルトでIPCはプロセス間でやりとりするメッセージをJSON形式の文字列にシリアライズします。
// メッセージ内容によっては送信した通りの値を受信側で取得できない場合もあります。

const { default: cluster } = require("cluster")

// 例 Dateのインスタンスが文字列として取得される
const dateObj = { lastDayofHeisei: new Date(2019, 3, 30, ) }

const stringifiedDateObj = JSON.stringify(dateObj)

JSON.parse(stringifiedDateObj)

typeof _.lastDayofHeisei

// 循環参照もJSONに対応してないので、エラーになります。
const circular = { bar: 1 }

circular.foo = circular

JSON.stringify(circular)

// シリアライズはこのデフォルトの方法のほかに、構造化クローンアルゴリズムという方法も利用できる
// この方法を利用する場合は、setupMaster()でserializationにadvancedを指定します。(デフォルトはjson)
cluster.setupMaster({
    exec: `${__dirname}/web-app`,
    serialization: 'advanced'
})

// 構造化クローンアルゴリズムは一般にJSON形式よりも強力で下記のようなデータ型も正しくクローンできます。
// ・Symbolを除く全てのプリミティブ型(文字列、数値、真偽値など)
// ・Booleanオブジェクt
// ・Stringオブジェクト
// ・Date
// ・RegExp(正規表現オブジェクト、ただしlastIndexフィールドはコピーされない)
// ・ArrayBuffer、SharedArrayBuffer
// ・Array、Map、Set
// ・プレーンなオブジェクト(たとえば{ foo: 1 }のようにオブジェクトリテラルで作られたオブジェクト)
// ・循環参照

// v8.serialize()、v8.deserialize()を使うと、構造化クローンアルゴリズムによるシリアライズ、デシリアライズの挙動を確認できます。
const circularWithDate = { lastDayOfHeisei: new Date(2019, 3, 30, 9) }

circularWithDate.foo = circularWithDate

const serializedCircularWithDate = v8.serialize(circularWithDate)

v8.deserialize(serializedCircularWithDate)

_.lastDayOfHeisei instanceof Date