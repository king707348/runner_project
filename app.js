const express = require('express')

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'ok'
    })
})

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        statusCode: 200,
        message: 'success get health',
        data: {}
    })
})

module.exports = app