const assert = require('node:assert/strict')
const { test } = require('node:test')
const { execFileSync } = require('node:child_process')
const path = require('node:path')

const loggerPath = path.join(__dirname, '../../src/utils/logger.js')

// 以子行程載入 logger，取得實際輸出的 log 內容
function runLogger(script, env = {}) {
    return execFileSync(process.execPath, ['-e', script], {
        env: { ...process.env, NODE_ENV: 'production', LOG_LEVEL: 'info', ...env },
        encoding: 'utf8'
    })
}

test('正式環境輸出單行 JSON，包含 level、time、msg', () => {
    const output = runLogger(`require(${JSON.stringify(loggerPath)}).info({ a: 1 }, 'hello')`)
    const line = JSON.parse(output.trim())

    assert.equal(line.level, 30)
    assert.equal(line.msg, 'hello')
    assert.equal(line.a, 1)
    assert.ok(line.time)
})

test('LOG_LEVEL=warn 時不輸出 info', () => {
    const output = runLogger(`require(${JSON.stringify(loggerPath)}).info('hidden')`, { LOG_LEVEL: 'warn' })
    assert.equal(output.trim(), '')
})

test('Authorization header 會被遮蔽', () => {
    const output = runLogger(
        `require(${JSON.stringify(loggerPath)}).info({ req: { headers: { authorization: 'secret' } } }, 'x')`
    )
    assert.equal(JSON.parse(output.trim()).req.headers.authorization, '[Redacted]')
})
