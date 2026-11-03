require('dotenv').config();

const app = require('./app');
const { initializeDatabase, closeDatabase } = require('./database/dataSource');

const PORT = Number(process.env.PORT) || 3000;

initializeDatabase()
  .then(() => {
    const server = app.listen(PORT, () => {
      const baseUrl = `http://localhost:${PORT}`;
      console.log(`Server is running at ${baseUrl}`);
      console.log(`GET ${baseUrl}/`);
      console.log(`GET ${baseUrl}/health`);
      console.log(`GET ${baseUrl}/api-docs`);
      console.log(`GET ${baseUrl}/api-docs.json`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] 收到 ${signal} 訊號，正在優雅關閉伺服器與資料庫連線...`);
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  })
  .catch((err) => {
    console.error('❌ [Server] 資料庫連線失敗，無法啟動伺服器:', err);
    process.exit(1);
  });
