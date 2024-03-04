import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IConfig } from "src/configruration/types";
import { ITokenPayload } from "src/types/tokens.types";
import { User } from "src/schemas/user.schema";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<IConfig>("app").accessSecret,
    });
  }

  async validate(payload: ITokenPayload): Promise<User> {
    const user = await this.usersService.getById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
