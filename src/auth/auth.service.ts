import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import ValidationException from "src/classes/ValidationException";
import { IConfig } from "src/configruration/types";
import CreateUserDto from "src/dtos/users/createUser.dto";
import LoginUserDto from "src/dtos/users/loginUser.dto";
import { User } from "src/schemas/user.schema";
import { StorageService } from "src/storage/storage.service";
import { ITokens } from "src/types/tokens.types";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private storageService: StorageService,
  ) {}

  async registration(dto: CreateUserDto): Promise<ITokens> {
    const user = await this.usersService.create(dto);
    await this.storageService.createUserStorage(user["_id"]);
    return this.generateTokens(user["_id"]);
  }

  async login(dto: LoginUserDto): Promise<ITokens> {
    const user = await this.validate(dto.email, dto.password);
    return this.generateTokens(user["_id"]);
  }

  async delete(dto: LoginUserDto): Promise<User> {
    const user = await this.validate(dto.email, dto.password);
    await this.storageService.deleteUserStorage(user["_id"]);
    return this.usersService.delete(user["_id"]);
  }

  async refresh(refreshToken: string): Promise<ITokens> {
    try {
      const { refreshSecret } = this.configService.get<IConfig>("app");
      const { sub } = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
      if (!(await this.usersService.getById(sub))) {
        throw new UnauthorizedException();
      }
      return this.generateTokens(sub);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async getProfile(userId: string): Promise<Omit<User, "password">> {
    const user = await this.usersService.getById(userId);
    if (!user) {
      throw new NotFoundException("Пользователя с таким id не существует");
    }
    const { password, ...userWithoutPassword } = user["_doc"];
    return userWithoutPassword;
  }

  private async generateTokens(userId: string): Promise<ITokens> {
    const { accessSecret, refreshSecret, accessExpiration, refreshExpiration } =
      this.configService.get<IConfig>("app");
    return {
      access: await this.jwtService.signAsync(
        { sub: userId },
        { secret: accessSecret, expiresIn: accessExpiration },
      ),
      refresh: await this.jwtService.signAsync(
        { sub: userId },
        { secret: refreshSecret, expiresIn: refreshExpiration },
      ),
    };
  }

  private async validate(email: string, password: string): Promise<User> {
    const user = await this.usersService.getByEmail(email);
    if (!user) {
      throw new ValidationException({
        description: "Пользователя с таким Email не существует",
        cause: "email",
      });
    }
    if (user.password !== password) {
      throw new ValidationException({
        description: "Неправильный пароль",
        cause: "password",
      });
    }
    return user;
  }
}
