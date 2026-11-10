require('dotenv').config();

const app = require('../src/app');
const logger = require('../src/utils/logger');
const { initializeDatabase, closeDatabase } = require('../db/data-source');

const PORT = Number(process.env.PORT) || 3000;

initializeDatabase()
  .then(() => {
    const server = app.listen(PORT, () => {
      logger.info(`Server is running at http://localhost:${PORT}`);
    });

    const shutdown = async (signal) => {
      logger.info(`[Server] 收到 ${signal} 訊號，正在優雅關閉伺服器與資料庫連線...`);
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  })
  .catch((err) => {
    logger.fatal({ err }, '[Server] 資料庫連線失敗，無法啟動伺服器');
    process.exit(1);
  });
