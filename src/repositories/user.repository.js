const { getUserRepository } = require('../../db/data-source');
const { UserSchema } = require('../../db/entities');

/**
 * 使用者資料存取層（Repository）。
 * 所有方法的最後一個參數 manager 為選用：傳入交易中的 EntityManager 時會在同一個交易內執行，
 * 未傳入則使用全域 DataSource。
 */
class UserRepository {
  /**
   * 取得 TypeORM Repository。
   * @param {import('typeorm').EntityManager} [manager] 交易用的 EntityManager（選用）
   * @returns {import('typeorm').Repository} 對應的 Repository
   */
  getRepository(manager) {
    if (manager && typeof manager.getRepository === 'function') {
      return manager.getRepository(UserSchema);
    }
    return getUserRepository();
  }

  /**
   * 新增使用者。
   * @param {object} data 使用者欄位
   * @returns {Promise<object>} 新增後的使用者
   */
  async createUser(data, manager) {
    const repo = this.getRepository(manager);
    const user = repo.create(data);
    return repo.save(user);
  }

  /**
   * 依 id 查詢使用者，找不到時回傳 null。
   */
  async findUserById(id, manager) {
    const repo = this.getRepository(manager);
    return repo.findOneBy({ id });
  }

  /**
   * 依 Email 查詢使用者，找不到時回傳 null。
   * 注意：passwordHash 欄位預設不會被選出（select: false）。
   */
  async findUserByEmail(email, manager) {
    const repo = this.getRepository(manager);
    return repo.findOneBy({ email });
  }

  /**
   * 依第三方登入（OAuth）供應商與帳號 id 查詢使用者。
   */
  async findUserByOAuth(oauthProvider, oauthId, manager) {
    const repo = this.getRepository(manager);
    return repo.findOneBy({ oauthProvider, oauthId });
  }

  /**
   * 查詢使用者列表，可依角色篩選，依建立時間由新到舊排序。
   * @param {{role?: 'USER'|'ADMIN'}} [filters]
   */
  async getUsers({ role } = {}, manager) {
    const repo = this.getRepository(manager);
    const where = {};
    if (role) {
      where.role = role;
    }
    return repo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 更新使用者並回傳更新後的資料（update 本身不回傳資料，故需再查一次）。
   */
  async updateUser(id, fields, manager) {
    const repo = this.getRepository(manager);
    await repo.update(id, fields);
    return repo.findOneBy({ id });
  }

  /**
   * 刪除使用者，回傳被刪除的資料；若原本就不存在則回傳 null。
   */
  async deleteUser(id, manager) {
    const repo = this.getRepository(manager);
    const user = await repo.findOneBy({ id });
    if (user) {
      await repo.delete(id);
    }
    return user;
  }
}

// 同時匯出類別（方便測試替換）與共用單例
module.exports = {
  UserRepository,
  userRepository: new UserRepository(),
};
