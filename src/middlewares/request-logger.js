const pinoHttp = require('pino-http');
const { randomUUID } = require('node:crypto');
const logger = require('../utils/logger');

/**
 * 每個請求記錄一行：方法、路徑、狀態碼、耗時，並產生 request id。
 * 4xx 記 warn、5xx 記 error，其餘記 info。
 * 必須註冊在所有路由之前。
 */
const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existingId = req.headers['x-request-id'];
    if (existingId) return existingId;
    const id = randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  // 只保留必要欄位，避免每筆 log 塞滿 headers
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // 健康檢查很頻繁，不記錄以免洗版
  autoLogging: { ignore: (req) => req.url === '/health' },
});

module.exports = requestLogger;
