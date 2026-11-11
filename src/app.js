const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const openApiSpec = require('./openapi');
const { AppDataSource } = require('../db/data-source');
const requestLogger = require('./middlewares/request-logger');
const notFound = require('./middlewares/not-found');
const errorHandler = require('./middlewares/error-handler');

// Express 應用程式實例（僅建立與設定，監聽由 bin/www.js 負責，方便測試）
const app = express();

// 請求紀錄必須最先註冊，才能涵蓋後續所有 middleware 與路由
app.use(requestLogger);
app.use(cors({
  // 允許的來源由環境變數控制，未設定時開放所有來源
  origin: process.env.CORS_ORIGIN || '*',
}));
// 解析 JSON request body
app.use(express.json());

// 根路徑：確認 API 有回應
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'ok',
  });
});

// 健康檢查：供 Docker / 負載平衡器探測；資料庫已連線時額外執行 SELECT 1 驗證連線可用
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

// 輸出 OpenAPI 規格原始 JSON
app.get('/api-docs.json', (req, res) => {
  res.status(200).json(openApiSpec);
});

// Swagger UI 互動式 API 文件
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// 404 與全域錯誤處理必須放在所有路由之後
app.use(notFound);
app.use(errorHandler);

module.exports = app;
