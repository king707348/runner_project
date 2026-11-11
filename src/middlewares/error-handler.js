const { fail } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * 全域錯誤處理（必須有 4 個參數 Express 才會視為錯誤處理 middleware）。
 * 必須註冊在 404 之後、所有 middleware 的最後面。
 */
function errorHandler(err, req, res, next) {
  // 回應已送出一半時，交給 Express 預設處理
  if (res.headersSent) {
    return next(err);
  }

  // AppError 或套件（如 express.json 解析失敗）帶的 4xx 狀態碼
  const statusCode = err.statusCode || err.status || 500;
  const isClientError = statusCode >= 400 && statusCode < 500;

  if (!isClientError) {
    // 優先用 req.log，log 會帶有 request id
    (req.log || logger).error({ err }, '未預期的伺服器錯誤');
  }

  // 5xx 不把內部訊息暴露給前端
  const message = isClientError
    ? err.name === 'AppError' ? err.message : '請求格式錯誤'
    : '伺服器發生錯誤，請稍後再試';

  // 只有自行定義的 AppError 才回傳 code，避免洩漏資料庫等內部錯誤代號
  const code = err.name === 'AppError' ? err.code : undefined;
  return fail(res, message, isClientError ? statusCode : 500, code);
}

module.exports = errorHandler;
