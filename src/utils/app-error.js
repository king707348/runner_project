/**
 * 自訂業務錯誤。
 * 在 controller / service 中 throw 之後，會由全域錯誤處理統一回覆。
 */
class AppError extends Error {
  /**
   * @param {string} message 回給前端的錯誤訊息
   * @param {number} [statusCode=400] HTTP 狀態碼
   * @param {string} [code] 前端可判斷用的錯誤代碼（例如 EVENT_NOT_FOUND）
   */
  constructor(message, statusCode = 400, code) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = AppError;
