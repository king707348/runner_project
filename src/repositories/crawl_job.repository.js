const { AppDataSource, getCrawlJobRepository } = require('../../db/data-source');
const { CrawlJobSchema } = require('../../db/entities');

/**
 * 爬蟲任務紀錄資料存取層（Repository）。
 * 所有方法的最後一個參數 manager 為選用：傳入交易中的 EntityManager 時會在同一個交易內執行，
 * 未傳入則使用全域 DataSource。
 */
class CrawlJobRepository {
  /**
   * 取得 TypeORM Repository。
   * @param {import('typeorm').EntityManager} [manager] 交易用的 EntityManager（選用）
   * @returns {import('typeorm').Repository} 對應的 Repository
   */
  getRepository(manager) {
    if (manager && typeof manager.getRepository === 'function') {
      return manager.getRepository(CrawlJobSchema);
    }
    return getCrawlJobRepository();
  }

  /**
   * 新增爬蟲任務紀錄。
   */
  async createCrawlJob(data, manager) {
    const repo = this.getRepository(manager);
    const job = repo.create(data);
    return repo.save(job);
  }

  /**
   * 依 id 查詢爬蟲任務，並一併載入操作者（operator）。
   */
  async findCrawlJobById(id, manager) {
    const repo = this.getRepository(manager);
    return repo.findOne({
      where: { id },
      relations: ['operator'],
    });
  }

  /**
   * 查詢最近的爬蟲任務，依建立時間由新到舊排序。
   * @param {number} [limit=20] 最多回傳筆數
   */
  async findRecentCrawlJobs(limit = 20, manager) {
    const repo = this.getRepository(manager);
    return repo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['operator'],
    });
  }

  /**
   * 更新爬蟲任務並回傳更新後的資料。
   */
  async updateCrawlJob(id, fields, manager) {
    const repo = this.getRepository(manager);
    await repo.update(id, fields);
    return repo.findOneBy({ id });
  }
}

// 同時匯出類別（方便測試替換）與共用單例
module.exports = {
  CrawlJobRepository,
  crawlJobRepository: new CrawlJobRepository(),
};
