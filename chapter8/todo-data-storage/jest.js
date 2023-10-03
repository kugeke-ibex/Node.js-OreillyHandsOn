const jest = require('jest-mock')

const expect = require('expect')
// console.log()のモックを生成
jest.spyOn(console, 'log')

// console.log()を実行
console.log('foo')
// 正しいアサーション
expect.expect(console.log).toHaveBeenCalledWith('foo')
// 正しいアサーション
expect.expect(console.log).toHaveBeenCalledTimes(1)
// 誤ったアサーション
expect.expect(console.log).toHaveBeenCalledWith('bar')
// 誤ったアサーション
expect.expect(console.log).toHaveBeenCalledTimes(2)

// jest.spyOn()は第一引数にオブジェクト、第二引数にそのオブジェクトの関数名を指定し、
// その関数のモックを生成します。引数や回数に対しのアサーションはexpect()のAPIで実行できます。
// 誤ったアサーションをすると、JestAssertionErrorが投げられます。
// jest.spyOn()の生成するオブジェクトはSinonJSで言えばスパイではなくスタブに相当するため、代替実装も定義できます。
// 固定値を返す
console.log.mockReturnValue(true)
console.log('foo')
// 代替実装を関数で定義
console.log.mockImplementation((arg1, arg2) => arg1 + arg2)
console.log('foo', 'bar')
// 'foobar'

// jest.fn()の使い方はsinon.stub()に引数を指定しない使い方と似ていますが、
// jest.fn()には引数としてモックが実行された場合に実行される関数を渡せます。
// 何も渡さなかった場合は何もしない関数としてモックが生成されますが、このモックのインターフェイスは
// jest.spyOn()が生成するモットと同じなので、後からmockImplementation()などの実装を定義することもできます。

// 実装のないモック
const emptyMock = jest.fn()
// モックの実行
emptyMock(10, 20)
// アサーション
expect.expect(emptyMock).toHaveBeenCalledTimes(1)
// 実装が定義されたモック
const multiplyMock = jest.fn((a, b) => a * b)
// モックの実行
multiplyMock(10, 20)
// アサーション
expect(multiplyMock).toHaveBeenCalledTimes(1)

// jest.mock()はREPLからでは簡単に試せない。
// sinon.stub(uuid, 'v4')のようにスタブを生成する場合、uuid.v4がスタブで置き換え可能である必要がありますが、
// uuidモジュールの実装はそのような置換を許可しません。

const uuid = require('uuid')

// 文字列への置換を試みる
uuid.v4 = 'foo'

uuid.v4
//[Function: v4]

// 一方jest.mock()を使えば、次のような記述でモックを生成できます。
// uuidのモックを生成
jest.mock('uuid')
// モックが'a'という文字列を返すようにする
uuid.v4.mockReturnValue('a')

// 第二引数に代替実装を返す関数を与えることで、1行で済ませることも可能
jest.mock('uuid', () => ({ v4: () => 'a'}))
// ※ これが可能なのは、Jestによるテスト実行時のrequire()本来のrequire()とは異なる特殊な実装を含むものに置き換えられるためですが、
// その仕組みに詳細については説明を省く。
// jest.spyOn()で振る舞いを変化させてしまった関数は、jest.restoreAllMocks()で全て元に戻せます。
// Jestの設定でrestoreMocksをtrueにすると、jest.restoreAllMocks()をテストごとに実行する意味と同じ。

// Jestのセールスポイントの1つはテストを並列に実行するため高速なことですが、並列に実行されるのは異なるファイルに存在する
// テストケースであり、同一ファイル内のテストケースは逐次的に実行されます。

// 実際のブラウザ上でテストコードを実行する場合は、Karmaというツールがよく使われます。
// Karmaの設定ファイルに、利用するブラウザや起動時のオプション、タイムアウトや結果の出力方法などについての設定を記述すると、
// その記述に基づいてブラウザを制御してテストを実行してくれます。

// より高速なブラウザ環境でのテストを実現するために、jsdomというNode.js上に仮想的なDOM環境を提供するライブラリが使われることもあります。
// JestはtestEnvironmentオプションに何も指定しなかった場合(またはjsdomを指定した場合)、jsdomが提供する環境でテストを実行します。
// jsdomの利用によりテストの実行は高速しますが、ブラウザ依存の不具合が検知できなくなるデメリットもあります。



