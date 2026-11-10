// 伺服器啟動入口：先載入 .env，再初始化資料庫並開始監聽
require('dotenv').config();

const app = require('../src/app');
const logger = require('../src/utils/logger');
const { initializeDatabase, closeDatabase } = require('../db/data-source');

// 監聽埠號，未設定或非數字時預設 3000
const PORT = Number(process.env.PORT) || 3000;

// 資料庫連線成功後才啟動 HTTP 伺服器，避免服務在無資料庫下對外
initializeDatabase()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info(`Server is running at http://localhost:${PORT}`);
    });

    // 優雅關閉：先停止接收新連線，待既有請求處理完再關閉資料庫
    const shutdown = async (signal) => {
      logger.info(`[Server] 收到 ${signal} 訊號，正在優雅關閉伺服器與資料庫連線...`);
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };

    // Ctrl+C（本機開發）與 SIGTERM（Docker / 雲端平台停止容器）都走同一套關閉流程
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  })
  // 資料庫連線失敗時記錄 fatal 並以非 0 結束碼退出，讓容器平台能偵測並重啟
  .catch((err) => {
    logger.fatal({ err }, '[Server] 資料庫連線失敗，無法啟動伺服器');
    process.exit(1);
  });
