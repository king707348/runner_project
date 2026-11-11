const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')
require('dotenv').config()
const app = require('../../src/app')

// 整合測試：以隨機埠號啟動真實 HTTP 伺服器，再用 fetch 驗證回應
let server
let baseUrl

before(async () => {
    // 埠號傳 0 由作業系統分配空閒埠，避免與開發中的伺服器衝突
    server = app.listen(0, '127.0.0.1')
    await new Promise((resolve, reject) => {
        server.once('listening', resolve)
        server.once('error', reject)
    })
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve())
        })
    }
})

test('GET / returns the existing success response', async () => {
    const response = await fetch(baseUrl)

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
        status: 'success',
        statusCode: 200,
        message: 'ok'
    })
})

test('GET /health returns a successful health response', async () => {
    const response = await fetch(`${baseUrl}/health`)

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
        status: 'success',
        statusCode: 200,
        message: 'success get health',
        data: {}
    })
})

test('CORS preflight responds according to the configured origin', async () => {
    const requestOrigin = 'https://client.example'
    const configuredOrigin = process.env.CORS_ORIGIN || '*'
    const expectedOrigin = configuredOrigin === '*'
        ? '*'
        : configuredOrigin === requestOrigin ? requestOrigin : null
    const response = await fetch(`${baseUrl}/health`, {
        method: 'OPTIONS',
        headers: {
            Origin: requestOrigin,
            'Access-Control-Request-Method': 'GET'
        }
    })

    assert.equal(response.status, 204)
    assert.equal(response.headers.get('access-control-allow-origin'), expectedOrigin)
    assert.match(response.headers.get('access-control-allow-methods'), /GET/)
})

test('GET /api-docs.json exposes the documented API paths', async () => {
    const response = await fetch(`${baseUrl}/api-docs.json`)
    const spec = await response.json()

    assert.equal(response.status, 200)
    assert.equal(spec.openapi, '3.0.3')
    assert.ok(spec.paths['/'])
    assert.ok(spec.paths['/health'])
})

test('GET /api-docs serves the Swagger UI', async () => {
    const response = await fetch(`${baseUrl}/api-docs/`)
    const html = await response.text()

    assert.equal(response.status, 200)
    assert.match(html, /swagger-ui/i)
})

test('未定義的路徑回傳統一格式的 404', async () => {
    const response = await fetch(`${baseUrl}/not-exist`)

    assert.equal(response.status, 404)
    assert.deepEqual(await response.json(), {
        success: false,
        message: '找不到路徑 GET /not-exist',
        code: 'NOT_FOUND'
    })
})

test('JSON 格式錯誤回傳統一格式的 400', async () => {
    const response = await fetch(`${baseUrl}/health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{bad json'
    })
    const body = await response.json()

    assert.equal(response.status, 400)
    assert.equal(body.success, false)
})

// 驗證 request id：未帶入時自動產生；有帶入時沿用
test('回應帶有 X-Request-Id，且會沿用請求帶入的 id', async () => {
    const generated = await fetch(`${baseUrl}/`)
    assert.ok(generated.headers.get('x-request-id'))

    const reused = await fetch(`${baseUrl}/`, { headers: { 'X-Request-Id': 'my-id' } })
    assert.equal(reused.headers.get('x-request-id'), 'my-id')
})
