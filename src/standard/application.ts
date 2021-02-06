import { Application } from "../application/Application";
import { Next } from "./basic";

/**
 * 启动器
 */
export type Booter = (app: Application, next: Next) => any;

/**
 * 配置对象
 */
export interface Config {
  /**
   * 写入配置
   * @param key
   * @param value
   */
  set<T>(key: string | symbol, value: T): void;

  /**
   * 读取配置
   * @param key
   */
  get<T>(key: string | symbol): T;
}

/**
 * 日志等级
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

/**
 * 日志对象
 */
export interface Logger {
  /**
   * 日志等级
   */
  level: LogLevel;

  /**
   * 调试日志
   * @param logs
   */
  debug(...logs: any[]): void;

  /**
   * 信息日志
   * @param logs
   */
  info(...logs: any[]): void;

  /**
   * 警告日志
   * @param logs
   */
  warn(...logs: any[]): void;

  /**
   * 错误日志
   * @param logs
   */
  error(...logs: any[]): void;

  /**
   * 失败日志
   * @param logs
   */
  fatal(...logs: any[]): void;
}
