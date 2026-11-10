const { AppDataSource, getEventRepository } = require('../../db/data-source');
const { EventSchema } = require('../../db/entities');

/**
 * 賽事資料存取層（Repository）。
 * 所有方法的最後一個參數 manager 為選用：傳入交易中的 EntityManager 時會在同一個交易內執行，
 * 未傳入則使用全域 DataSource。
 */
class EventRepository {
  /**
   * 取得 TypeORM Repository。
   * @param {import('typeorm').EntityManager} [manager] 交易用的 EntityManager（選用）
   * @returns {import('typeorm').Repository} 對應的 Repository
   */
  getRepository(manager) {
    if (manager && typeof manager.getRepository === 'function') {
      return manager.getRepository(EventSchema);
    }
    return getEventRepository();
  }

  /**
   * 新增賽事。
   * @param {object} data 賽事欄位
   * @returns {Promise<object>} 新增後的賽事
   */
  async createEvent(data, manager) {
    const repo = this.getRepository(manager);
    const event = repo.create(data);
    return repo.save(event);
  }

  /**
   * 依 id 查詢賽事，並一併載入建立者與最後更新者。
   */
  async findEventById(id, manager) {
    const repo = this.getRepository(manager);
    return repo.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });
  }

  /**
   * 依爬蟲指紋（fingerprint）查詢賽事，用來避免重複匯入同一場賽事。
   */
  async findEventByFingerprint(fingerprint, manager) {
    const repo = this.getRepository(manager);
    return repo.findOneBy({ fingerprint });
  }

  /**
   * 依條件查詢賽事列表，依賽事日期由近到遠排序。
   * 所有篩選條件皆為選用，未提供的條件不會加入查詢。
   * @param {object} [filters]
   * @param {string} [filters.category] 賽事類型
   * @param {string} [filters.status] 賽事狀態
   * @param {string} [filters.county] 縣市
   * @param {string} [filters.startDate] 賽事日期起（含）
   * @param {string} [filters.endDate] 賽事日期迄（含）
   * @param {number} [filters.minDistance] 最短距離（公里）
   * @param {number} [filters.maxDistance] 最長距離（公里）
   * @param {string} [filters.search] 關鍵字，模糊比對名稱、場地與主辦單位
   * @param {number} [filters.limit=20] 每頁筆數
   * @param {number} [filters.offset=0] 略過筆數
   */
  async findEvents({
    category,
    status,
    county,
    startDate,
    endDate,
    minDistance,
    maxDistance,
    search,
    limit = 20,
    offset = 0,
  } = {}, manager) {
    const repo = this.getRepository(manager);
    // 使用 QueryBuilder 動態組合條件；一律使用具名參數綁定，避免 SQL injection
    const qb = repo.createQueryBuilder('event');

    if (category) {
      qb.andWhere('event.category = :category', { category });
    }
    if (status) {
      qb.andWhere('event.status = :status', { status });
    }
    if (county) {
      qb.andWhere('event.county = :county', { county });
    }
    if (startDate) {
      qb.andWhere('event.event_date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('event.event_date <= :endDate', { endDate });
    }
    // 距離可能為 0，因此用 !== undefined 判斷而非 truthy
    if (minDistance !== undefined) {
      qb.andWhere('event.distance_km >= :minDistance', { minDistance });
    }
    if (maxDistance !== undefined) {
      qb.andWhere('event.distance_km <= :maxDistance', { maxDistance });
    }
    if (search) {
      qb.andWhere(
        '(event.name ILIKE :search OR event.venue ILIKE :search OR event.organizer ILIKE :search)',
        // ILIKE 為 PostgreSQL 不分大小寫的模糊比對
        { search: `%${search}%` },
      );
    }

    // 分頁：take / skip 搭配 QueryBuilder 可正確處理關聯資料
    qb.orderBy('event.event_date', 'ASC')
      .take(limit)
      .skip(offset);

    return qb.getMany();
  }

  /**
   * 更新賽事並回傳更新後的資料。
   */
  async updateEvent(id, fields, manager) {
    const repo = this.getRepository(manager);
    await repo.update(id, fields);
    return repo.findOneBy({ id });
  }

  /**
   * 刪除賽事，回傳被刪除的資料；若原本就不存在則回傳 null。
   */
  async deleteEvent(id, manager) {
    const repo = this.getRepository(manager);
    const event = await repo.findOneBy({ id });
    if (event) {
      await repo.delete(id);
    }
    return event;
  }
}

// 同時匯出類別（方便測試替換）與共用單例
module.exports = {
  EventRepository,
  eventRepository: new EventRepository(),
};
