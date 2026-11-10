const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

/**
 * 全專案共用的 logger（pino）。
 * - 正式環境：輸出單行 JSON，方便 log 平台收集
 * - 開發環境：用 pino-pretty 輸出易讀格式
 * - 等級由 LOG_LEVEL 控制（預設 info；測試可設 silent）
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // 敏感欄位不寫入 log
  redact: ['req.headers.authorization', 'req.headers.cookie'],
  ...(isProduction || isTest
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { translateTime: 'SYS:yyyy/mm/dd HH:MM:ss', ignore: 'pid,hostname' },
        },
      }),
});

module.exports = logger;
