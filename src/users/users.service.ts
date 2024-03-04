import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as moment from "moment";
import { Model } from "mongoose";
import CreateUserDto from "src/dtos/users/createUser.dto";
import { User } from "src/schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = new this.userModel({
      ...dto,
      createdAt: moment.utc().format(),
    });
    return user.save();
  }

  async delete(userId: string): Promise<User> {
    if (!(await this.getById(userId))) {
      throw new BadRequestException("Пользователя с таким id не существует");
    }
    return this.userModel.findByIdAndDelete(userId);
  }

  async getByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async getById(userId: string): Promise<User> {
    return this.userModel.findById(userId).exec();
  }
}
