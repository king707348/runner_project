const { AppDataSource, getCrawlJobRepository } = require('../../db/data-source');
const { CrawlJobSchema } = require('../../db/entities');

class CrawlJobRepository {
  getRepository(manager) {
    if (manager && typeof manager.getRepository === 'function') {
      return manager.getRepository(CrawlJobSchema);
    }
    return getCrawlJobRepository();
  }

  async createCrawlJob(data, manager) {
    const repo = this.getRepository(manager);
    const job = repo.create(data);
    return repo.save(job);
  }

  async findCrawlJobById(id, manager) {
    const repo = this.getRepository(manager);
    return repo.findOne({
      where: { id },
      relations: ['operator'],
    });
  }

  async findRecentCrawlJobs(limit = 20, manager) {
    const repo = this.getRepository(manager);
    return repo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['operator'],
    });
  }

  async updateCrawlJob(id, fields, manager) {
    const repo = this.getRepository(manager);
    await repo.update(id, fields);
    return repo.findOneBy({ id });
  }
}

module.exports = {
  CrawlJobRepository,
  crawlJobRepository: new CrawlJobRepository(),
};
