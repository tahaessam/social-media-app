import BaseRepo from "./base.repo.js";
import User, { IUser } from "../../modules/user/user.model.js";

class UserRepo extends BaseRepo<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string) {
    return this.findOne({ email });
  }

  async findByGoogleId(googleId: string) {
    return this.findOne({ googleId });
  }

  async findByVerificationToken(token: string) {
    return this.findOne({ verificationToken: token });
  }

  async findByResetPasswordToken(token: string) {
    return this.findOne({ resetPasswordToken: token });
  }

  async verifyUser(id: string) {
    return this.updateById(id, {
      isVerified: true,
      verificationToken: undefined,
    });
  }
}

export default UserRepo;
