const assert = require('node:assert/strict')
const { after, before, beforeEach, test } = require('node:test')
const bcrypt = require('bcrypt')
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

test('POST /auth/register requires email, nickname, and password', async () => {
    const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'runner@example.com', nickname: 'Runner' }),
    })

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), {
        success: false,
        message: 'Email, nickname, and password are required',
    })
})

test('POST /auth/register rejects an existing email', async () => {
    existingUser = { id: '1', email: 'runner@example.com' }

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

test('POST /auth/register rejects an email used by a Google OAuth user', async () => {
    googleUser = { id: '1', email: 'runner@example.com' }

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
