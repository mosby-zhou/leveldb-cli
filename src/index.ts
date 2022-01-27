import _ from 'lodash';
import level from 'level';
import fs from 'fs';
import path from 'path';

/**
 * Syslog UDP options.
 */
export type LeveldbCliOptions = {
  /**
   * Enable debug log. Defaults to `false`.
   */
  debug: boolean;

  filepath: string;
};

const defaultLeveldbCliOptions: LeveldbCliOptions = {
  debug: false,
  filepath: '',
};

/**
 * A LeveldbCli library.
 */
export class LeveldbCli {
  private options: LeveldbCliOptions;

  private _db: level.LevelDB;

  constructor(options: LeveldbCliOptions) {
    if (!options.filepath) {
      throw new Error(`Need select file path`);
    }
    const filepath = path.resolve(options.filepath);
    if (!fs.existsSync(filepath)) {
      throw new Error(`File: [${filepath}] not exists`);
    }
    this.options = {
      ...defaultLeveldbCliOptions,
      ...options,
      filepath: filepath,
    };
    this._db = level(filepath);
  }

  async listAll(): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for await (const [key, value] of this._db.iterator() as any) {
      result[_.startsWith(key, '_file://') ? key.slice(10) : key] = value;
    }
    return result;
  }

  async get(key: string): Promise<string> {
    return await this._db.get(`_file://\x00\x01${key}`);
  }

  async set(key: string, value: string): Promise<void> {
    return await this._db.put(`_file://\x00\x01${key}`, value);
  }
}
