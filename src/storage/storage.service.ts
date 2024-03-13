import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import * as _path from "path";
import * as fse from "fs-extra";
import * as storageScripts from "src/scripts/storage";
import { IEntity, IStorageInfo } from "src/types/storage.types";
import {
  READABLE_FORMATS,
  REGEXPS,
  STORAGE_MAX_SIZE,
} from "src/constants/storage";

@Injectable()
export class StorageService {
  async createUserStorage(userId: string): Promise<void> {
    const storagePath = _path.resolve(`storage/${userId}`);
    try {
      await fse.mkdir(storagePath);
    } catch {
      throw new InternalServerErrorException(
        "Произошла ошибка при создании хранилища пользователя",
      );
    }
  }

  async deleteUserStorage(userId: string): Promise<void> {
    const storagePath = _path.resolve(`storage/${userId}`);
    try {
      await fse.rmdir(storagePath, { recursive: true });
    } catch {
      throw new InternalServerErrorException(
        "Произошла ошибка при удалении хранилища пользователя",
      );
    }
  }

  async getStorageInfo(userId: string): Promise<IStorageInfo> {
    const storagePath = _path.resolve(`storage/${userId}`);
    if (!(await fse.pathExists(storagePath))) {
      throw new BadRequestException("Хранилища по данному пути не существует");
    }
    try {
      return {
        totalSize: await storageScripts.getDirSize(storagePath, true),
        entitiesCount: await storageScripts.getEntitiesCountInDir(
          storagePath,
          true,
        ),
        maxSize: STORAGE_MAX_SIZE,
      };
    } catch {
      throw new InternalServerErrorException(
        "Произошла ошибка при получении информации о хранилище",
      );
    }
  }

  async getStorageEntitiesList(
    userId: string,
    path: string,
  ): Promise<IEntity[]> {
    const dirPath = _path.resolve(`storage/${userId}${path}`);
    if (!(await fse.pathExists(dirPath))) {
      throw new BadRequestException(
        `Директории по данному пути ${path} не существует`,
      );
    }
    try {
      return storageScripts.getEntitiesListInDir(dirPath, false);
    } catch {
      throw new InternalServerErrorException(
        "Произошла ошибка при получении списка файлов из директории",
      );
    }
  }

  async readFile(userId: string, path: string): Promise<string> {
    const filePath = _path.resolve(`storage/${userId}${path}`);
    if (!(await fse.pathExists(filePath))) {
      throw new BadRequestException(
        `Файла по данному пути ${path} не существует`,
      );
    }
    if (!(await fse.lstat(filePath)).isFile()) {
      throw new BadRequestException(
        `Сущность по данному пути ${path} не является файлом`,
      );
    }
    try {
      if (READABLE_FORMATS.includes(filePath.match(REGEXPS.FILE_EXT)[1])) {
        return storageScripts.getTextFromFile(filePath);
      }
      return path;
    } catch {
      throw new InternalServerErrorException(
        "Произошла ошибка при чтении файла",
      );
    }
  }

  async uploadEntities(
    userId: string,
    path: string,
    file: Express.Multer.File,
  ): Promise<void> {
    const dirPath = _path.resolve(`storage/${userId}${path}`);
    const { totalSize } = await this.getStorageInfo(userId);
    if (totalSize + file.size > STORAGE_MAX_SIZE) {
      throw new BadRequestException(
        `Ваше хранилище заполено. Максимальный размер хранилища: ${storageScripts.formatBytes(STORAGE_MAX_SIZE)}`,
      );
    }
    if (!(await fse.pathExists(dirPath))) {
      throw new BadRequestException(
        `Директории по данному пути ${path} не существует`,
      );
    }
    try {
      await fse.appendFile(_path.join(dirPath, file.originalname), file.buffer);
    } catch {
      throw new InternalServerErrorException(
        "Произошла ошибка при добавлении файлов в хранилище",
      );
    }
  }

  async deleteEntity(userId: string, path: string): Promise<void> {
    const entityPath = _path.resolve(`storage/${userId}${path}`);
    if (!(await fse.pathExists(entityPath)) || path === "/") {
      throw new BadRequestException(
        `Сущности по данному пути ${path} не существует`,
      );
    }
    try {
      await fse.rm(entityPath, { recursive: true });
    } catch {
      throw new InternalServerErrorException(
        "Произошла ошибка при удалении файлов из хранилища",
      );
    }
  }
}
