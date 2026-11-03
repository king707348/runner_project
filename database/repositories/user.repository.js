const { AppDataSource, getUserRepository } = require('../dataSource');
const { UserSchema } = require('../entities');

class UserRepository {
  getRepository(manager) {
    if (manager && typeof manager.getRepository === 'function') {
      return manager.getRepository(UserSchema);
    }
    return getUserRepository();
  }

  async createUser(data, manager) {
    const repo = this.getRepository(manager);
    const user = repo.create(data);
    return repo.save(user);
  }

  async findUserById(id, manager) {
    const repo = this.getRepository(manager);
    return repo.findOneBy({ id });
  }

  async findUserByEmail(email, manager) {
    const repo = this.getRepository(manager);
    return repo.findOneBy({ email });
  }

  async findUserByOAuth(oauthProvider, oauthId, manager) {
    const repo = this.getRepository(manager);
    return repo.findOneBy({ oauthProvider, oauthId });
  }

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

  async updateUser(id, fields, manager) {
    const repo = this.getRepository(manager);
    await repo.update(id, fields);
    return repo.findOneBy({ id });
  }

  async deleteUser(id, manager) {
    const repo = this.getRepository(manager);
    const user = await repo.findOneBy({ id });
    if (user) {
      await repo.delete(id);
    }
    return user;
  }
}

module.exports = {
  UserRepository,
  userRepository: new UserRepository(),
};
