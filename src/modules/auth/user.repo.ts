import { BaseRepo } from "../../repo/base.repo";
import User from "./user.model";

class UserRepo extends BaseRepo {
    constructor() {
        super(User);
    }
}

export default UserRepo;