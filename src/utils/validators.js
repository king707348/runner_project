/**
 * 常用格式檢查工具。
 */

/**
 * 是否為「有內容」的字串（排除 null、數字、空字串、純空白）。
 * @param {*} value
 * @returns {boolean}
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * 是否為正整數（接受 "3" 這種數字字串，方便檢查 query string）。
 * @param {*} value
 * @returns {boolean}
 */
function isPositiveInteger(value) {
  const num = Number(value);
  return value !== '' && value !== null && Number.isInteger(num) && num > 0;
}

/**
 * 是否為有效的日期字串（例如 2026-11-10）。
 * @param {*} value
 * @returns {boolean}
 */
function isValidDate(value) {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

/**
 * 是否為 UUID。
 * @param {*} value
 * @returns {boolean}
 */
function isUuid(value) {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

/**
 * 解析 query 的分頁參數，不合法時使用預設值，並限制每頁上限。
 * @param {{page?: string, pageSize?: string}} query
 * @param {{defaultPageSize?: number, maxPageSize?: number}} [options]
 * @returns {{page: number, pageSize: number, offset: number}}
 */
function parsePagination(query = {}, options = {}) {
  const { defaultPageSize = 6, maxPageSize = 50 } = options;
  const page = isPositiveInteger(query.page) ? Number(query.page) : 1;
  const rawSize = isPositiveInteger(query.pageSize)
    ? Number(query.pageSize)
    : defaultPageSize;
  const pageSize = Math.min(rawSize, maxPageSize);
  return { page, pageSize, offset: (page - 1) * pageSize };
}

module.exports = {
  isNonEmptyString,
  isPositiveInteger,
  isValidDate,
  isUuid,
  parsePagination,
};
