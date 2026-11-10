const AppError = require('../utils/app-error');

/**
 * 404 處理：所有路由都沒比對到時，丟給全域錯誤處理。
 * 必須註冊在所有路由之後。
 */
function notFound(req, res, next) {
  next(new AppError(`找不到路徑 ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

module.exports = notFound;
