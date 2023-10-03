'use strict'
const { assert } = require('chai')

// 各データストレージに対するテストをまとめて記述
for (const dataStorageName of ['file-system', 'sqlite', 'leveldb']) {
    const { fetchAll, fetchByCompleted, create, update, remove } = require(`../../${dataStorageName}`)

    describe(dataStorageName, () => {
        // 毎回のテスト実行前に全てのToDoを削除
        beforeEach(async () => {
            const allTodos = await fetchAll()
            await Promise.all(allTodos.map(({ id }) => remove(id)))
        })

        describe('create()、fetchAll()', () => {
            it('create()で作成したToDoをfetchAll()で取得できる', async () => {
                // 初期状態の確認
                assert.deepEqual(await fetchAll(), [])

                // ToDoを1件追加
                const todo1 = { id: 'a', title: 'ネーム', completed: false }
                await create(todo1)
                assert.deepEqual(await fetchAll(), [todo1])

                // ToDoをさらに2件追加
                const todo2 = { id: 'b', title: '下書き', completed: true }
                await create(todo2)
                const todo3 = { id: 'c', title: 'ペン入れ', completed: false }
                await create(todo3)
                // 順序を無視した配列の比較
                assert.sameDeepMembers(await fetchAll(), [todo1, todo2, todo3])
            })
            
        })

        describe('fetchByCompleted()', () => {
            it(
                'completedの値が引数で指定したものと等しいToDoだけを取得できる',
                async () => {
                    // 初期状態の確認
                    assert.deepEqual(await fetchByCompleted(true), [])
                    assert.deepEqual(await fetchByCompleted(false), [])

                    // ToDoを3件追加
                    const todo1 = { id: 'a', title: 'ネーム', completed: false }
                    await create(todo1)
                    const todo2 = { id: 'b', title: '下書き', completed: true }
                    await create(todo2)
                    const todo3 = { id: 'c', title: 'ペン入れ', completed: false }
                    await create(todo3)

                    // fetchByCompletedの結果を確認
                    assert.deepEqual(await fetchByCompleted(true), [todo2])
                    assert.sameDeepMembers(
                        await fetchByCompleted(false),
                        [todo1, todo3]
                    )
                }
            )
        })

        describe('update()', () => {
            const todo1 = { id: 'a', title: 'ネーム', completed: false }
            const todo2 = { id: 'b', title: '下書き', completed: false }

            // update()のテストでは、あらかじめbeforeEach()でToDoを作成しておき、それらに対して更新を行います。
            // update()自体が更新後のToDoの内容を返すことと、更新後fetchByComplete()によって返されるTodoの内容が実際に変わっていることを検証します。
            // また、存在しないIDを指定して実行するとnullが返され、fetchByCompleted()の結果が変わらないことも検証します。
            beforeEach(async () => {
                await create(todo1)
                await create(todo2)
            })

            it('指定したIDのTodoを更新し、更新後のToDoを返す', async () => {
                // todo1のcompletedを更新
                assert.deepEqual(
                    await update('a', { completed: true}),
                    { id: 'a', title: 'ネーム', completed: true}
                )
                assert.deepEqual(
                    await fetchByCompleted(true),
                    [{ id: 'a', title: 'ネーム', completed: true}]
                )
                assert.deepEqual(await fetchByCompleted(false), [todo2])

                // todo2のtitleを更新
                assert.deepEqual(
                    await update('b', { title: 'ペン入れ' }),
                    { id: 'b', title: 'ペン入れ', completed: false }
                )
                assert.deepEqual(
                    await fetchByCompleted(true),
                    [{ id: 'a', title: 'ネーム', completed: true}]
                )
                assert.deepEqual(
                    await fetchByCompleted(false),
                    [{ id: 'b', title: 'ペン入れ', completed: false }]
                )
            })

            it('存在しないIDを指定するとnullを返す', async () => {
                assert.isNull(await update('c', { completed: true }))
                assert.deepEqual(await fetchByCompleted(true), [])
                assert.sameDeepMembers(await fetchByCompleted(false), [todo1, todo2])
            })
        })

        describe('remove()', () => {
            const todo1 = { id: 'a', title: 'ネーム', completed: false }
            const todo2 = { id: 'b', title: '下書き', completed: false }

            // remove()のテストでも、あらかじめbeforeEach()でToDoを作成した上で、削除を行います。
            // 削除後にfetchall()が削除したToDoを返さないこと、また存在しないIDを指定して実行するとnullを返すし
            // fetchAll()の結果が変化しないことを確認します。
            beforeEach(async () => {
                await create(todo1)
                await create(todo2)
            })

            it('指定したIDのToDoを削除する', async () => {
                assert.strictEqual(await remove('b'), 'b')
                assert.deepEqual(await fetchAll(), [todo1])
            })

            it('存在しないIDを指定するとnullを返す', async () => {
                assert.strictEqual(await remove('c'), null)
                assert.sameDeepMembers(await fetchAll(), [todo1, todo2])
            })
        })
    })
}

// beforeEach()で毎回のテストケース実行前にToDoを全て削除しておきます。
// これにより、全てのテストケースを、データベースストレージ内にToDoが1軒もない状態から開始できます。
// この処理は非同期処理なので、async関数内で実行します。
