import { Config as IConfig } from "../standard/application";

/**
 * 配置对象
 */
export class Config implements IConfig {
  /**
   * 内部数据
   */
  protected data: Map<string | symbol, any> = new Map();

  /**
   * 写入配置
   * @param key
   * @param value
   */
  public set<T>(key: string | symbol, value: T): void {
    this.data.set(key, value);
  }

  /**
   * 读取配置
   * @param key
   */
  get<T>(key: string | symbol): T {
    return this.data.get(key);
  }
}
