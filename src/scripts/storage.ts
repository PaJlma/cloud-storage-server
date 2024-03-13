import * as _path from "path";
import * as fse from "fs-extra";
import { IEntity } from "src/types/storage.types";

export function formatBytes(bytes: number, decimals = 0) {
  if (!+bytes) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`;
}

export async function getDirSize(
  path: string,
  recursive?: boolean,
): Promise<number> {
  const files = await fse.readdir(path, { recursive });
  const lstats = await Promise.all(
    files.map((file) => fse.lstat(_path.join(path, file))),
  );
  return lstats.reduce((accumulator, stat) => accumulator + stat.size, 0);
}

export async function getEntitiesCountInDir(
  path: string,
  recursive?: boolean,
): Promise<number> {
  return (await fse.readdir(path, { recursive })).length;
}

export async function getTextFromFile(path: string): Promise<string> {
  return (await fse.readFile(path)).toString("utf8");
}

export async function getEntitiesListInDir(
  path: string,
  recursive?: boolean,
): Promise<IEntity[]> {
  const files = await fse.readdir(path, { recursive });
  const lstats = await Promise.all(
    files.map((file) => fse.lstat(_path.join(path, file))),
  );
  return lstats.map((lstat, index) => ({
    name: files[index].toString(),
    type: lstat.isFile() ? "file" : lstat.isDirectory() ? "dir" : "unknown",
    size: lstat.size,
    birthtime: lstat.birthtime,
  }));
}
