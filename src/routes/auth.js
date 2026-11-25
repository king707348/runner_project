const express = require('express')
const bcrypt = require('bcrypt')
const { userRepository } = require('../repositories/user.repository')
const logger = require('../utils/logger')
const { success, fail } = require('../utils/response')

const router = express.Router()

router.post('/register', async (req, res) => {
    const { email, nickname, password } = req.body || {}
    const normalizedEmail = email.trim()
    const normalizedNickname = nickname.trim()
    // 檢查使用者是否已存在
    const exitingUserFunc = async () => {
        const existingUser = await userRepository.findUserByEmail(normalizedEmail)

        if (existingUser) {
            return fail(res, 'Email already exists', 400)
        }
    }
    // 雜湊後儲存使用者資料
    const hashedPasswordSaveFunc = async () => {
        const passwordHash = await bcrypt.hash(password, 10)

        await userRepository.createUser({
            email: normalizedEmail,
            nickname: normalizedNickname,
            passwordHash,
        })
    }

    try {
        if (
            typeof email !== 'string' || !normalizedEmail ||
            typeof nickname !== 'string' || !normalizedNickname ||
            typeof password !== 'string' || !password
        ) {
            return fail(res, 'Email, nickname, and password are required', 400)
        }

        await exitingUserFunc()
        await hashedPasswordSaveFunc()

        logger.info(`User ${normalizedNickname} registered successfully`)

        return success(res, { message: 'User registered successfully' }, 201)
    } catch (error) {
        logger.error({ err: error }, 'Failed to register user')

        return fail(res, 'Internal Server Error', 500)
    }
})

module.exports = router