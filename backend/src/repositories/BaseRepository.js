class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id, populateOptions = '') {
    return this.model.findById(id).populate(populateOptions);
  }

  async findOne(filter, populateOptions = '') {
    return this.model.findOne(filter).populate(populateOptions);
  }

  async find(filter = {}, sort = {}, populateOptions = '', limit = 0, skip = 0) {
    let query = this.model.find(filter).sort(sort).populate(populateOptions);
    if (skip > 0) query = query.skip(skip);
    if (limit > 0) query = query.limit(limit);
    return query;
  }

  async update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async updateMany(filter, data) {
    return this.model.updateMany(filter, data);
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async paginate(filter = {}, page = 1, limit = 10, sort = {}, populateOptions = '') {
    const skip = (page - 1) * limit;
    const items = await this.find(filter, sort, populateOptions, limit, skip);
    const total = await this.count(filter);
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = BaseRepository;
