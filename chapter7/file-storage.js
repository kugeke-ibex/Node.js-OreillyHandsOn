// node --experimental-reple-awitで実行

const path = require("path")

// ディレクトリを作成
await fs.promises.mkdir('todos')

// 存在しないバスはrecursiveオプションを指定して実行する
await fs.promises.mkdir('todos/foo/bar', { recursive: true })

// ディレクトリを削除
await fs.promises.rmdir('todos/foo')

// エラーなしに実行する場合は、recursiveオプションを指定して実行する
await fs.promises.rmdir('todos/foo', { recursive: true })

const todo1 = JSON.stringify({ id: 1, title: 'ネーム', 'completed': false })

// ファイルに書き込み。存在しなければ、新規作成あればファイルの内容を上書き。
await fs.promises.writeFile('todos/1.json', todo1)

// すでにファイルがある場合、エラーにするには第三引数のフラグを指定する
await fs.promises.writeFile('todos/1.json', todo1, { flag: 'wx'})

// ディレクトリの読み込み
await fs.promises.readdir('todos')

// ファイルの読み込み
await fs.promises.readFile('todos/1.json')

// ファイルの読み込み。(テキストデータとして扱いたいならば、第二引数にエンコードを指定して文字列に変換する)
// 存在しないパスを指定するとエラーになります
await fs.promises.readFile('todos/1.json', 'utf8')

// require()でも読み込みは可能ですが、ファイル内容をキャッシュしてしまいます。
// delete requre.cache[require.resolve('./todos/1.json)]

// ファイルの削除
// 存在しないパスを指定するとエラーになります
await fs.promises.unlink('todos/1.json')

const filePath = 'path/to/file.txt'
path.parse(filePath)

// パス文字列の結合
path.join('path1', 'path2')
path.join('foo/bar', '..', '/baz', 'file.txt')
// 絶対パス文字列の生成(「/」から始まる引数がある場合はその以降の引数で絶対パスを作成する)
path.resolve('path1', 'path2')
path.resolve('foo/bar', '..', '/baz', 'file.txt')
