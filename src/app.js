const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const openApiSpec = require('./openapi');
const { AppDataSource } = require('../db/data-source');
const requestLogger = require('./middlewares/request-logger');
const notFound = require('./middlewares/not-found');
const errorHandler = require('./middlewares/error-handler');

const app = express();

app.use(requestLogger);
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'ok',
  });
});

app.get('/health', async (req, res) => {
  if (AppDataSource.isInitialized) {
    try {
      await AppDataSource.query('SELECT 1');
    } catch {
      return res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'database connection check failed',
      });
    }
  }

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'success get health',
    data: {},
  });
});

app.get('/api-docs.json', (req, res) => {
  res.status(200).json(openApiSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// 404 與全域錯誤處理必須放在所有路由之後
app.use(notFound);
app.use(errorHandler);

module.exports = app;
