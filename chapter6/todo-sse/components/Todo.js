// 外部のモジュールで公開されたものを利用するためのimport文
import { useEffect, useState } from "react";
import Link from 'next/link'
import Head from 'next/head'
// import 'isomorphic-fetch'

// 各ページに関する情報の定義
const pages = {
    index: { title: 'すべてのToDo'},
    active: { title: '未完了のTodo', completed: false},
    completed: { title: '完了したTodo', completed: true },
}

// CSRでページを切り替えるためのリンク
const pageLinks = Object.keys(pages).map((page, index) =>
    <Link href={`/${page === 'index' ? '' : page}`} key={index}>
        <a style={{ marginRight: 10}}>{pages[page].title}</a>
    </Link>
)

// Reactコンポーネントを実装し、外部のモジュールで利用可能なexport文で公開
export default function Todos(props) {
    const { title, completed } = pages[props.page]

    // コンポーネントの状態の初期化と、propsの値に応じた更新
    const [todos, setTodos] = useState([])
    useEffect(() => {
        // fetchによるTodo取得の実装を削除
        // fetch(`/api/todos${fetchQuery}`)
        // .then(async res => res.ok
        //     ? setTodos(await res.json())
        //     : alert(await res.text())
        // )
        // EventSourceを使った実装に置き換え
        const eventSource = new EventSource('/api/todos/events')
        // SSE受信時の処理
        eventSource.addEventListener('message', e => {
            const todos = JSON.parse(e.data)
            setTodos(
                typeof completed === 'undefined'
                    ? todos
                    : todos.filter(todo => todo.completed === completed)
            )
        })
        // エラーハンドリング
        eventSource.addEventListener('error', e => console.log('SSEエラー', e))
        // useEffectで関数を返すと副作用のクリーンアップとして実行される
        // ここでは、EventSourceインスタンスをクローズする
        // 副作用のクリーンアップは、コンポーネント内で次の副作用が発生するときや、コンポーネントが画面から取り除かれるときに実行される

        return () => eventSource.close()
    }, [props.page]) //第二引数に[props.page]を指定すると、props.pageが変わった時だけ副作用が適応される。

    // このコンポーネントが描写するUIをJSX構文で記述して返す
    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <h1>{title}</h1>
            {/* ToDo一覧の表示 */}
            <ul>
                {todos.map(({ id, title, completed }) => 
                    <li key={id}>
                        <span style={completed ? { textDecoration: 'line-through' } : {}}>
                            {title}
                        </span>
                    </li>
                )}
            </ul>
            <div>{pageLinks}</div>
        </>
    )
}

// require('isomorphic-fetch')
// await fetch('http://localhost:3000/api/todos', {
//     method: 'POST',
//     headers: {
//          'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ title: 'ペン入れ' })
// })
// console.log(_.status, await _.json())

// タイムアウトを1秒にすると、2回目以降のリクエストヘッダにLast-Event-IDヘッダが設定される.
// サーバーサイドではこのヘッダの値に基いて、接続時にクライアントが未受診のデータだけを送信するような制御を加えます。