const assert = require('node:assert/strict')
const { after, before, beforeEach, test } = require('node:test')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = require('../../src/app')
const { userRepository } = require('../../src/repositories/user.repository')

let server
let baseUrl
let existingUser = null
let googleUser = null
let createdUser

before(async () => {
    server = app.listen(0, '127.0.0.1')
    await new Promise((resolve, reject) => {
        server.once('listening', resolve)
        server.once('error', reject)
    })
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

beforeEach(() => {
    existingUser = null
    googleUser = null
    createdUser = undefined
    userRepository.findUserByEmail = async () => existingUser
    userRepository.findUserByEmailForLogin = async () => existingUser
    userRepository.findUserByOAuth = async () => googleUser
    userRepository.createUser = async (data) => {
        createdUser = data
        return data
    }
})

after(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve())
        })
    }
})

//  email, nickname, and password 為必填，否則回傳400
test('POST /auth/register requires email, nickname, and password', async () => {
    const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'runner@example.com',
            nickname: 'Runner'
        })
    })

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), {
        success: false,
        message: 'Email, nickname, and password are required',
    })
})

// 拒絕已有的email註冊
test('POST /auth/register rejects an existing email', async () => {
    existingUser = {
        id: '1',
        email: 'runner@example.com'
    }

    const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'runner@example.com',
            nickname: 'Runner',
            password: 'password123',
        }),
    })

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), {
        success: false,
        message: 'Email already exists',
    })
    assert.equal(createdUser, undefined)
})

// 拒絕來自google 第三方email的註冊
test('POST /auth/register rejects an email used by a Google OAuth user', async () => {
    googleUser = {
        id: '1',
        email: 'runner@example.com'
    }

    const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'runner@example.com',
            nickname: 'Runner',
            password: 'password123',
        }),
    })

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), {
        success: false,
        message: 'Email already exists with Google OAuth',
    })
    assert.equal(createdUser, undefined)
})

// 註冊成功
test('POST /auth/register hashes the password and creates an entity-shaped user', async () => {
    const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: ' runner@example.com ',
            nickname: ' Runner ',
            password: 'password123',
        }),
    })

    assert.equal(response.status, 201)
    assert.deepEqual(await response.json(), {
        success: true,
        data: { message: 'User registered successfully' },
    })
    assert.equal(createdUser.email, 'runner@example.com')
    assert.equal(createdUser.nickname, 'Runner')
    assert.equal(await bcrypt.compare('password123', createdUser.passwordHash), true)
    assert.equal(Object.hasOwn(createdUser, 'password'), false)
})

// 沒有註冊的使用者 回傳401
test('POST /auth/login returns 401 for non-existent user', async () => {
    const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'nonexistent@example.com',
            password: 'password123'
        }),
    })

    assert.equal(response.status, 401)
    assert.deepEqual(await response.json(), {
        success: false,
        message: '帳號或密碼錯誤',
    })
})

// 密碼錯誤 回傳401
test('POST /auth/login returns 401 for an incorrect password', async () => {
    existingUser = {
        id: '42',
        email: 'runner@example.com',
        nickname: 'Runner',
        passwordHash: await bcrypt.hash('password123', 10),
    }

    const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'runner@example.com',
            password: 'wrong-password',
        }),
    })

    assert.equal(response.status, 401)
    assert.deepEqual(await response.json(), {
        success: false,
        message: '帳號或密碼錯誤',
    })
})

// 登入成功 回傳token
test('POST /auth/login returns a JWT for a valid user', async () => {
    const originalSecret = process.env.JWT_SECRET
    const secret = 'test-jwt-secret'
    process.env.JWT_SECRET = secret

    try {
        existingUser = {
            id: '42',
            email: 'runner@example.com',
            nickname: 'Runner',
            passwordHash: await bcrypt.hash('password123', 10),
        }

        const response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'runner@example.com',
                password: 'password123',
            }),
        })
        const body = await response.json()

        assert.equal(response.status, 200)
        assert.equal(body.success, true)
        assert.equal(body.data.message, 'Login successful')
        assert.equal(typeof body.data.token, 'string')

        const payload = jwt.verify(body.data.token, secret)
        assert.equal(payload.id, '42')
        assert.equal(payload.email, 'runner@example.com')
    } finally {
        if (originalSecret === undefined) {
            delete process.env.JWT_SECRET
        } else {
            process.env.JWT_SECRET = originalSecret
        }
    }
})