import mongoose from "mongoose";

export class BaseRepo {
    constructor(protected readonly model: mongoose.Model<any>) {
    }

    async create(data: any) {
        return await this.model.create(data);
    }

    async findAll(query: any = {}) {
        return await this.model.find(query);
    }

    async findOne(query: any) {
        return await this.model.findOne(query);
    }

    async findById(id: string) {
        return await this.model.findById(id);
    }

    async updateOne(query: any, update: any) {
        return await this.model.updateOne(query, update);
    }

    async findByIdAndUpdate(id: string, update: any, options: any = {}) {
        return await this.model.findByIdAndUpdate(id, update, options);
    }

    async findByIdAndDelete(id: string) {
        return await this.model.findByIdAndDelete(id);
    }
}   