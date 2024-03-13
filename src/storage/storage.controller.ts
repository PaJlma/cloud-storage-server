import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { StorageService } from "./storage.service";
import { IEntity, IStorageInfo } from "src/types/storage.types";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";

@Controller("storage")
export class StorageController {
  constructor(private storageService: StorageService) {}

  @UseGuards(JwtAuthGuard)
  @Get(":userId")
  async getStorageInfo(@Param("userId") userId: string): Promise<IStorageInfo> {
    return this.storageService.getStorageInfo(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":userId/list")
  async getStorageEntitiesList(
    @Param("userId") userId: string,
    @Query("path") path = "/",
  ): Promise<IEntity[]> {
    return this.storageService.getStorageEntitiesList(userId, path);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":userId/read")
  async readFile(
    @Param("userId") userId: string,
    @Query("path") path = "/",
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    response.contentType("text/plain");
    return this.storageService.readFile(userId, path);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":userId/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @Param("userId") userId: string,
    @Query("path") path = "/",
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    return this.storageService.uploadEntities(userId, path, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":userId/delete")
  async deleteEntity(
    @Param("userId") userId: string,
    @Query("path") path = "/",
  ) {
    return this.storageService.deleteEntity(userId, path);
  }
}
