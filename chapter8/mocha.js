// Mochaをフレームワークに使うなら他ツールを利用します。
// アサーションにChai、テストダブルにSinon.JS、ガバレッジにIstanbulを使う。
// npm install -D mocha chai sinon nyc
// nycはIstanbulのCLIを提供するパッケージで、それ以外はその名の通りそれぞのパッケージを提供

// テスト対象の機能ごとにテストケースをまとめる
describe('xxxモジュール', () => {
    // フック
    before(() => {
        // テストの事前準備
    })
    beforeEach(() => {
        // テストケースごとの事前準備
    })
    after(() => {
        // テストの後片付け
    })
    afterEach(() => {
        // テストケースごとの後片付け
    })
    // テストケースの記述
    it('xxxにxxxをセットするとxxxがxxxになる', () => {
        // テスト対象の機能の実行、結果のアサーション
    })
    // describeはネストできる
    describe('xxx関数', () => {
        // フックはネストされたdescribeの中にも記述できる
        beforeEach(() => {
            // テストケースごとの事前準備
        })
        // ...
        // テストケースの記述
        it('xxxにxxxをセットするとxxxがxxxになる', () => {
            // テスト対象の機能の実行、結果のアサーション
        })
    })
})

// テストケースはit()により記述し、第一引数にテストの内容を表現する文言を、
// 第二引数に実際のテストコードを関数として指定。
// describe()はテストケースをテスト対象(モジュール、クラス、関数など)ごとにグルーピングするのに使われる
// describe()の中にはdescribe()、it()、のほかフック処理をネストできます。
// before()はdescribe()内の全テストケースの実行前に1回だけ実行する処理
// beforeEach()は各テストケース実行前に毎回実行する処理
// after()はdescribe()内の全テストケースの実行後に1回だけ実行する処理
// afterEach()は各テストケース実行後に毎回実行する処理
// フックはdescribe()で囲まれていない部分にも記述でき、その場合はそのフックは全ファイルに存在するテストに対して適用されます。
// describe()、it()やフック関数はMochaによるテスト実行時にグローバルに定義されるため、require()する必要はありません。

// 非同期処理のテスト
// Mochaで非同期処理に対するテストコードは3通りあります。
// 1つはit()の第二引数に渡す関数で、引数としてコールバック関数を取るようにし、非同期処理の完了時にそれを実行するというものです。
// エラーが発生した場合はコールバック実行時の引数にエラーを指定します。このコールバック関数は、習慣的にdoneと命名されます。
// テスト対象自体が引数にコールバックを取る形式で非同期処理を実装している場合、この方法は特に便利です。

describe('fs', () => {
    describe('writeFile', () => {
        it('エラーなしで実行できる', done => {
            fs.writeFile(
                'hello.txt',
                'Hello World',
                err => err ? done(err) : done()
            )
            // よりシンプルに記述すると
            fs.writeFile('hello.txt', 'Hello World', done)
        })
    })
})

// 2つ目の方法はit()の第二引数の関数の中でPromiseインスタンスを返す。
// 返されたPromiseインスタンスがfulfilledになればテストは成功として扱われ、rejectedになれば失敗として扱われます。

describe('fs', () => {
    describe('writeFile', () => {
        it('エラーなしで実行できる', () => {
            return fs.promises.writeFile('hello.txt', 'Hello world')
        })
    })
})

// 3つ目の方法は2つ目の方法とほぼ同じですがasync関数を使う。

describe('fs.promises', () => {
    describe('writeFile', () => {
        it('エラーなしで実行できる', async () => {
            await fs.promises.writeFile('hello.txt', 'Hello world')
        })
    })
})

// Chaiによるアサーション
// Chaiはアサーションのために、assert,expect,shouldという3種類のAPIを提供
// assertはNode.jsコアのassertモジュールとAPIが似ていますが、アサーションのための追加機能を提供し、ブラウザ上でも動作します。

const { assert } = require('chai')

const obj = {
    foo: 'foo',
    bar: 1
}
// === による等価性の評価
assert.strictEqual(obj.foo, 'foo')
// オブジェクトの中身の深い比較による等価性の評価
assert.deepEqual(obj, {
    foo: 'foo',
    bar: 1
})

// expectとshouldはどちらも振る舞い駆動開発(Behavior Driven Development、BDD)と呼ばれる開発手法をサポートするAPIです。
// BDDではユニットテストはソフトウェアの振る舞いを記述するものとして描かれ、仕様書に近いものとなります。
// このため、BDDでは自然言語に近い形式でテストコードをかけるようなAPIが求められます。
const { expect } = require('chai')

const obj2 = {
    foo: 'foo',
    bar: 1
}

// ===による等価性の評価
expect(obj2.foo).to.equal('foo')
// オブジェクトの中身の深い比較による等価性の評価
expect(obj2).to.deep.equal({
    foo: 'foo',
    bar: 1
})

// 下記の呼び出しで、Object.protoypeが拡張され、あらゆるオブジェクトでshouldプロパティが利用可能になります。
const { should } = require('chai')

const obj3 = {
    foo: 'foo',
    bar: 1
}
// ===による等価性の評価
obj3.foo.should.equal('foo')
// オブジェクトの中身の深い比較による等価性の評価
obj3.should.deep.equal({
    foo: 'foo',
    bar: 1
})

// shouldはプリミティブ値のプロパティも対応可能。(ラッパーオブジェクトに変換されるため)
// ただし、nullやundefiledにはラッパオブジェクトがないため、次のような書き方になります。
const should = require('chai').should()

const nullValue = null
should.not.exist(nullValue)

// assertやexpectを使う場合
const { assert, expect } = require('chai')
assert.isNull(nullValue)
expect(nullValue).to.be.null

// Mochaの設定はJavaScript(.mocharc.js)、JSON(.mocharc.jsonまたは.mocharc.jsonc)
// またはYAML(.mocharc.ymlまたは.mocharc.yaml)形式の設定ファイルに記述できるほか、package.jsonにmochaというプロパティを作りその中で
// 記述することも可能です。