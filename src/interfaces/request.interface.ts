import { Types } from "mongoose";

export interface IRequest {
    userId: Types.ObjectId;
    message: string;

}