const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { userRepository } = require('../repositories/user.repository')
const logger = require('../utils/logger')
const { success, fail } = require('../utils/response')

const router = express.Router()

// register
router.post('/register', async (req, res) => {
    const { email, nickname, password } = req.body || {}

    try {
        if (
            typeof email !== 'string' || !email.trim() ||
            typeof nickname !== 'string' || !nickname.trim() ||
            typeof password !== 'string' || !password
        ) {
            return fail(res, 'Email, nickname, and password are required', 400)
        }

        const normalizedEmail = email.trim()
        const normalizedNickname = nickname.trim()
        const existingUser = await userRepository.findUserByEmail(normalizedEmail)
        if (existingUser) {
            return fail(res, 'Email already exists', 400)
        }

        const isGoogleUser = await userRepository.findUserByOAuth('GOOGLE', normalizedEmail)
        if (isGoogleUser) {
            return fail(res, 'Email already exists with Google OAuth', 400)
        }

        const passwordHash = await bcrypt.hash(password, 10)
        await userRepository.createUser({
            email: normalizedEmail,
            nickname: normalizedNickname,
            passwordHash,
        })

        logger.info(`User ${normalizedNickname} registered successfully`)

        return success(res, { message: 'User registered successfully' }, 201)
    } catch (error) {
        logger.error({ err: error }, 'Failed to register user')

        return fail(res, 'Internal Server Error', 500)
    }
})

// login
router.post('/login', async (req, res) => {
    const { email, password } = req.body || {}

    try {
        if (typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password) {
            return fail(res, 'Email and password are required', 400)
        }

        const hasUser = await userRepository.findUserByEmailForLogin(email.trim())
        if (!hasUser) {
            return fail(res, '帳號或密碼錯誤', 401)
        }

        const isGoogleUser = hasUser.authProvider === 'GOOGLE' ||
            (!hasUser.passwordHash && (hasUser.hasOauth || hasUser.oauthProvider === 'GOOGLE'))
        if (isGoogleUser) {
            return fail(res, '此帳號使用 Google 登入，請使用 Google 登入', 401, 'GOOGLE_OAUTH_REQUIRED')
        }

        if (!hasUser.passwordHash) {
            return fail(res, '帳號或密碼錯誤', 401)
        }

        const isPasswordCorrect = await bcrypt.compare(password, hasUser.passwordHash)
        if (!isPasswordCorrect) {
            return fail(res, '帳號或密碼錯誤', 401)
        }

        const data = {
            id: hasUser.id,
            email: hasUser.email,
            role: hasUser.role,
        }

        const token = jwt.sign(
            data,
            process.env.JWT_SECRET,
            {
                expiresIn: '30d'
            }
        )

        logger.info(`User ${hasUser.nickname} logged in successfully`)
        return success(res, {
            message: 'Login successful',
            token,
            user: {
                nickname: hasUser.nickname,
                email: hasUser.email,
                role: hasUser.role,
                has_oauth: hasUser.hasOauth,
                must_change_password: hasUser.mustChangePassword,
                created_at: hasUser.createdAt,
            },
        }, 200)
    } catch(err) {
        logger.error({ err }, 'Failed to login user')
        
        return fail(res, 'Internal Server Error', 500)
    }
})

module.exports = router