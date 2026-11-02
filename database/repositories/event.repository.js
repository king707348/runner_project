const { AppDataSource, getEventRepository } = require('../dataSource');
const { EventSchema } = require('../entities');

class EventRepository {
  getRepository(manager) {
    if (manager && typeof manager.getRepository === 'function') {
      return manager.getRepository(EventSchema);
    }
    return getEventRepository();
  }

  async createEvent(data, manager) {
    const repo = this.getRepository(manager);
    const event = repo.create(data);
    return repo.save(event);
  }

  async findEventById(id, manager) {
    const repo = this.getRepository(manager);
    return repo.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });
  }

  async findEventByFingerprint(fingerprint, manager) {
    const repo = this.getRepository(manager);
    return repo.findOneBy({ fingerprint });
  }

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
    if (minDistance !== undefined) {
      qb.andWhere('event.distance_km >= :minDistance', { minDistance });
    }
    if (maxDistance !== undefined) {
      qb.andWhere('event.distance_km <= :maxDistance', { maxDistance });
    }
    if (search) {
      qb.andWhere(
        '(event.name ILIKE :search OR event.venue ILIKE :search OR event.organizer ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('event.event_date', 'ASC')
      .take(limit)
      .skip(offset);

    return qb.getMany();
  }

  async updateEvent(id, fields, manager) {
    const repo = this.getRepository(manager);
    await repo.update(id, fields);
    return repo.findOneBy({ id });
  }

  async deleteEvent(id, manager) {
    const repo = this.getRepository(manager);
    const event = await repo.findOneBy({ id });
    if (event) {
      await repo.delete(id);
    }
    return event;
  }
}

module.exports = {
  EventRepository,
  eventRepository: new EventRepository(),
};
