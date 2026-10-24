const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')
require('dotenv').config()
const app = require('../app')

let server
let baseUrl

before(async () => {
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
