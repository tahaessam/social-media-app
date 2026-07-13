import BaseRepo from "../../../common/repositories/base.repo.js";
import { IREQUEST } from "../interfaces/request.interface.js";
import { RequestModel } from "../models/Request.model.js";
export class RequestRepository extends BaseRepo<IREQUEST> {
  constructor() {
    super(RequestModel);
  }
}

export const requestRepository = new RequestRepository();