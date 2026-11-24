const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User } = require('../db/entities/user.entity')

const { success, fail } = require('../utils/response')
// 註冊路由
const router = express.Router()

// register
router.post('/register', async (req, res) => {
    const { username, password } = await req.body

    try {
        if (!username || !password) {
            return res.status(400).json(
                fail('Username and password are required')
            )
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)
        // Check if username already exists
        const exitingUser = await User.findOne({
            where: { username }
        })

        if(exitingUser) {
            return res.status(400).json(
                fail('Username already exists')
            )
        }

        //saver user to database
        await User.create({
            username,
            password: hashPassword
        })



        res.status(201).json(
            success('User registered successfully')
        )
    } catch (error) {
        res.status(500).json(
            fail('Internal Server Error')
        )
    }
})