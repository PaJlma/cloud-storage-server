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
import { ITokens } from "src/types/tokens.types";
import { UsersService } from "src/users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async registration(dto: CreateUserDto): Promise<ITokens> {
    if (await this.usersService.getByEmail(dto.email)) {
      throw new ValidationException({
        description: "Пользователь с таким Email уже существует",
        cause: "email",
      });
    }
    const user = await this.usersService.create(dto);
    return this.generateTokens(user["_id"]);
  }

  async login(dto: LoginUserDto): Promise<ITokens> {
    const user = await this.usersService.getByEmail(dto.email);
    if (!user) {
      throw new ValidationException({
        description: "Пользователя с таким Email не существует",
        cause: "email",
      });
    }
    return this.generateTokens(user["_id"]);
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
    const { accessSecret, refreshSecret } =
      this.configService.get<IConfig>("app");
    return {
      access: await this.jwtService.signAsync(
        { sub: userId },
        { secret: accessSecret, expiresIn: "1m" },
      ),
      refresh: await this.jwtService.signAsync(
        { sub: userId },
        { secret: refreshSecret, expiresIn: "30d" },
      ),
    };
  }
}
