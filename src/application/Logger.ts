import callsite from "callsite";
import { dirname } from "path";
import { Logger as ILogger, LogLevel } from "../standard/application";
/**
 * 日志组件
 */
export class Logger implements ILogger {
  /**
   * 日志等级
   */
  public level: LogLevel = LogLevel.INFO;

  /**
   * 日志打印方法
   * @param level
   * @param file
   * @param log
   */
  protected printf(level: number, file: string, log: any[]) {
    console.log(level, ...log);
  }

  /**
   * 调试日志
   * @param logs
   */
  public debug(...logs: any[]) {
    if (this.level > LogLevel.DEBUG) return;
    const stack = callsite()[1].getFileName();
    const file = dirname(stack);
    this.printf(LogLevel.DEBUG, file, logs);
  }

  /**
   * 信息日志
   * @param logs
   */
  public info(...logs: any[]) {
    if (this.level > LogLevel.INFO) return;
    const stack = callsite()[1].getFileName();
    const file = dirname(stack);
    this.printf(LogLevel.INFO, file, logs);
  }

  /**
   * 警告日志
   * @param logs
   */
  public warn(...logs: any[]) {
    if (this.level > LogLevel.WARN) return;
    const stack = callsite()[1].getFileName();
    const file = dirname(stack);
    this.printf(LogLevel.WARN, file, logs);
  }

  /**
   * 错误日志
   * @param logs
   */
  public error(...logs: any[]) {
    if (this.level > LogLevel.ERROR) return;
    const stack = callsite()[1].getFileName();
    const file = dirname(stack);
    this.printf(LogLevel.ERROR, file, logs);
  }

  /**
   * 失败日志
   * @param logs
   */
  public fatal(...logs: any[]) {
    if (this.level > LogLevel.FATAL) return;
    const stack = callsite()[1].getFileName();
    const file = dirname(stack);
    this.printf(LogLevel.FATAL, file, logs);
  }
}
