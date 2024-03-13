import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response, Request } from "express";
import CreateUserDto from "src/dtos/users/createUser.dto";
import { IAccessToken } from "src/types/tokens.types";
import { AuthService } from "./auth.service";
import LoginUserDto from "src/dtos/users/loginUser.dto";
import { User } from "src/schemas/user.schema";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("registration")
  async registration(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IAccessToken> {
    const { access, refresh } = await this.authService.registration(dto);
    response.cookie("refresh", refresh, { httpOnly: true });
    return { access };
  }

  @Post("login")
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IAccessToken> {
    const { access, refresh } = await this.authService.login(dto);
    response.cookie("refresh", refresh, { httpOnly: true });
    return { access };
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  async logout(@Res({ passthrough: true }) response: Response): Promise<void> {
    response.cookie("refresh", "");
  }

  @Delete("delete")
  async delete(@Body() dto: LoginUserDto): Promise<void> {
    await this.authService.delete(dto);
  }

  @Get("refresh")
  async refresh(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ): Promise<IAccessToken> {
    const oldRefresh = request.cookies?.refresh;
    if (!oldRefresh) {
      throw new BadRequestException("Не передан refresh cookie");
    }
    const { access, refresh } = await this.authService.refresh(oldRefresh);
    response.cookie("refresh", refresh, { httpOnly: true });
    return { access };
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile/")
  async getProfile(@Req() request: Request): Promise<Omit<User, "password">> {
    return this.authService.getProfile(request["user"]["_id"]);
  }
}
