const assert = require('node:assert/strict')
const { test } = require('node:test')
const v = require('../../src/utils/validators')
const { success, paginated, fail } = require('../../src/utils/response')

// 模擬 express 的 res，只記錄狀態碼與 body
function mockRes() {
    return {
        status(code) { this.statusCode = code; return this },
        json(body) { this.body = body; return this }
    }
}

test('isNonEmptyString', () => {
    assert.equal(v.isNonEmptyString('abc'), true)
    for (const x of ['', '   ', null, undefined, 123]) assert.equal(v.isNonEmptyString(x), false)
})

test('isPositiveInteger', () => {
    assert.equal(v.isPositiveInteger('3'), true)
    for (const x of ['0', '-1', '1.5', 'abc', '', null]) assert.equal(v.isPositiveInteger(x), false)
})

test('isValidDate / isUuid', () => {
    assert.equal(v.isValidDate('2026-11-10'), true)
    assert.equal(v.isValidDate('not-a-date'), false)
    assert.equal(v.isUuid('123e4567-e89b-12d3-a456-426614174000'), true)
    assert.equal(v.isUuid('123'), false)
})

test('parsePagination 預設值、上限與 offset', () => {
    assert.deepEqual(v.parsePagination({}), { page: 1, pageSize: 6, offset: 0 })
    assert.deepEqual(v.parsePagination({ page: '3', pageSize: '10' }), { page: 3, pageSize: 10, offset: 20 })
    assert.equal(v.parsePagination({ pageSize: '999' }).pageSize, 50)
    assert.equal(v.parsePagination({ page: '-2' }).page, 1)
})

test('response.success / paginated / fail 格式', () => {
    assert.deepEqual(success(mockRes(), { id: 1 }).body, { success: true, data: { id: 1 } })

    const res = paginated(mockRes(), [1, 2], { page: 1, pageSize: 6, total: 43 })
    assert.deepEqual(res.body.meta, { page: 1, pageSize: 6, total: 43, totalPages: 8 })

    const err = fail(mockRes(), '錯誤', 404, 'NOT_FOUND')
    assert.equal(err.statusCode, 404)
    assert.deepEqual(err.body, { success: false, message: '錯誤', code: 'NOT_FOUND' })
})
