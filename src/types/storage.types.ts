export interface IStorageInfo {
  totalSize: number;
  entitiesCount: number;
  maxSize: number;
}

export type EntityType = "file" | "dir" | "unknown";

export interface IEntity {
  name: string;
  type: EntityType;
  size: number;
  birthtime: Date;
}
