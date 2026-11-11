/**
 * 統一回覆格式。
 *
 * 成功：{ success: true, data, meta? }
 * 失敗：{ success: false, message, code? }
 *
 * 賽事列表等需要分頁的 API，從資料庫取完資料後，請呼叫 paginated()。
 */

/**
 * 回覆一般成功結果。
 * @param {import('express').Response} res
 * @param {*} data 回傳資料
 * @param {number} [statusCode=200]
 */
function success(res, data = null, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

/**
 * 回覆分頁成功結果。
 * @param {import('express').Response} res
 * @param {Array} data 當頁資料
 * @param {{page: number, pageSize: number, total: number}} pagination 分頁資訊
 */
function paginated(res, data, { page, pageSize, total }) {
  return res.status(200).json({
    success: true,
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

/**
 * 回覆失敗結果。
 * @param {import('express').Response} res
 * @param {string} message 錯誤訊息
 * @param {number} [statusCode=400]
 * @param {string} [code] 錯誤代碼
 */
function fail(res, message, statusCode = 400, code) {
  const body = { success: false, message };
  if (code) body.code = code;
  return res.status(statusCode).json(body);
}

module.exports = { success, paginated, fail };
