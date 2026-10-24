require('dotenv').config();

const app = require('./app')
const PORT = Number(process.env.PORT) || 3000

app.listen(PORT, () => {
    const baseUrl = `http://localhost:${PORT}`
    
    console.log(`server is ${baseUrl}`)
    console.log(`GET ${baseUrl}/`)
    console.log(`GET ${baseUrl}/health`)
    console.log(`GET ${baseUrl}/api-docs`)
    console.log(`GET ${baseUrl}/api-docs.json`)
})
