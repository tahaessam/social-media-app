import {
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  Types,
} from "mongoose";

export default abstract class BaseRepo<T> {
  protected constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>) {
    return this.model.create(data);
  }

  async find(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T>,
    options?: QueryOptions
  ) {
    return this.model.find(filter, projection, options);
  }

  async findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions
  ) {
    return this.model.findOne(filter, projection, options);
  }

  async findById(
    id: string | Types.ObjectId,
    projection?: ProjectionType<T>,
    options?: QueryOptions
  ) {
    return this.model.findById(id, projection, options);
  }

  async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>
  ) {
    return this.model.updateOne(filter, update);
  }

  async findOneAndUpdate(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>
  ) {
    return this.model.findOneAndUpdate(filter, update, {
      new: true,
    });
  }

  async updateById(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>
  ) {
    return this.model.findByIdAndUpdate(id, update, {
      new: true,
    });
  }

  async deleteOne(filter: FilterQuery<T>) {
    return this.model.deleteOne(filter);
  }

  async deleteById(id: string | Types.ObjectId) {
    return this.model.findByIdAndDelete(id);
  }

  async count(filter: FilterQuery<T> = {}) {
    return this.model.countDocuments(filter);
  }
}
