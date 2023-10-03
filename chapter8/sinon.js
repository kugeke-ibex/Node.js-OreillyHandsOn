// テストダブルはテスト対象のユニットが依存するものを置き換える代用品です。
// ユニットテストにおいて、ユニットが依存するものの生成、実行のコストを低減します。
// また、ここのユニットテストでユニットの依存先の仕様を把握する必要がなくなり、対象のユニットの挙動にフォーカスすることを可能にします。
// テストダブルの種類
// ・スパイ : 代用品として提供する実装がどのように実行されたか(引数や回数など)記録する機能を持つもの
// ・スタブ : 代用品として最低限機能する実装を提供するもの。ハードコードされた値を返す関数など
// ・モック : 代用品として提供する実装がどう実行されるかについて事前の期待が記述され、それに基づく検証の機能を持つもの

const sinon = require('sinon')
// console.log()のスパイを作成
sinon.spy(console, 'log')
console.log('foo')
// 正しいアサーション
sinon.assert.calledWith(console.log, 'foo')
sinon.assert.calledOnce(console.log)
// 間違ったアサーション
sinon.assert.calledWith(console.log, 'bar')
sinon.assert.calledTwice(console.log)

// sinon.spy()は第一引数にオブジェクト、第二引数にそのオブジェクトの関数名を指定、その関数のスパイを作成します。
// 関数自体の挙動は従来と変わりません。関数実行後、引数や回数に対しsinon.assertのAPIを使って、
// 正しいアサーションをすれば、エラーは発生しません。一方、間違ったアサーションをするとAssertErrorが発生します。

// sinon.spy()は引数なしで実行すると、オリジナルの実装のないスパイを生成できます。
// コールバックを引数に取る関数に渡して、それが期待通りに実行されるかを確認するような用途で用いられます。

const spy = sinon.spy()

setTimeout(spy, 0)

sinon.assert.calledOnce(spy)

// スタブの生成にはsinon.stub()を使う。それに続けてreturns()でスタブが返す値を指定します。
sinon.stub(String.prototype, 'startsWith').returns(true)

'foo'.startsWith('f')
'foo'.startsWith('x')

// 正しいアサーション
sinon.assert.calledWith(String.prototype.startsWith, 'f')
sinon.assert.calledTwice(String.prototype.startsWith)

// 間違ったアサーション
sinon.assert.calledWith(String.prototype.startsWith, 'y')
sinon.assert.calledOnce(String.prototype.startsWith)

// sinon.stub()への引数はspy()と同様です。インスタンスメソッドのスタブを作る場合は、第一引数にprototypeを指定。
// sinon.stub()に続けてreturns()などのスタブの挙動の指定を行わなった場合、実行しても何もしないスタブが生成されます。
// sinon.spy()と同様に引数なしで実行してオリジナルの実装の存在しないスタブを生成できます。
sinon.stub(String.prototype, 'endsWith')
'foo'.endsWith('o')

// sinon.mock()でモック対象のオブジェクトを、続けてexpects()でモック対象の関数名を指定します。
// さらにモックの実行に関する期待をメソッドチェーンで記述します。
// モックはスタブのAPIを持っているため、returns()を使って戻り値を指定できます。
// モックが期待を満たす形で実行されているかどうかをverify()で確認。
const mock = sinon.mock(JSON).expects('parse')
    // '{ "foo": 1}'という引数で1回以上2回以下実行されることを期待
    .withExactArgs('{ "foo": 1}').atLeast(1).atMost(2)
    // 戻り値として{}を返す
    .returns({})

// この時点で確認すると、期待が満たされないためエラーが投げられる
mock.verify()
// 期待を満たす引数で実行
JSON.parse('{ "foo": 1}')
//この時点では期待が満たされているためtrueが返される
mock.verify()
// 期待に反する引数で実行
JSON.parse('{ "bar": 1}')
// 期待を満たす引数で実行
JSON.parse('{ "foo": 1}')
// 引数は期待を満たすものの、回数は期待に反する実行
JSON.parse('{ "foo": 1}')

// テストダブルをそのままにしておくと、他のテストにも影響が出るので
// afterEach()など毎回のテスト後に、テストダブルの副作用を元に戻すsinon.restore()を実行する
