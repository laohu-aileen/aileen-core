import compose from "koa-compose";
import { glob } from "glob";
import { AppContext } from "../container/AppContext";
import { Booter, Logger as ILogger } from "../standard/application";
import { Logger } from "./Logger";
import { Config } from "./Config";
import callsite from "callsite";
import { join, dirname } from "path";
import { isRegister, isBooter } from "./Plugin";
import lodash from "lodash";
import fs from "fs";
import {
  ApplicationBean,
  ContainerBean,
  SysConfigBean,
  LoggerBean,
} from "../injector";

/**
 * 创建一个联合处理
 * @param bootes
 */
const composeHandler = (bootes: Booter[], ctx: any) =>
  new Promise<void>((resolve, reject) => {
    // 包装器
    const warp: Booter = async (_, next) => {
      try {
        await next();
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    // 插件注册
    const handles = [warp, ...bootes];
    compose(handles)(ctx);
  });

/**
 * 应用对象
 */
export class Application extends AppContext {
  /**
   * 应用注册
   */
  protected registers: Booter[] = [];

  /**
   * 应用启动
   */
  protected booters: Booter[] = [];

  /**
   * 启动时间
   */
  protected startAt: Date;

  /**
   * 创建时间
   */
  protected createdAt = new Date();

  /**
   * 已扫描文件
   */
  protected scanFiles: string[] = [];

  /**
   * 已注册模块
   */
  protected registereds: any[] = [];

  /**
   * 启动后执行
   */
  public afterStarted: Function;

  /**
   * 创建对象
   * @param parent
   */
  constructor(parent?: Application) {
    super(parent);

    // 容器初始化
    this.bind(Application).toValue(this);
    this.alias(Application, ApplicationBean.ID);
    this.alias(Application, ContainerBean.ID);

    // 注入默认配置
    if (!this.has(SysConfigBean.ID)) {
      this.bind(Config).toConstructor(Config);
      this.alias(Config, SysConfigBean.ID);
    }

    // 注入默认日志
    if (!this.has(LoggerBean.ID)) {
      this.bind(Logger).toConstructor(Logger);
      this.alias(Logger, LoggerBean.ID);
    }
  }

  /**
   * 引用插件
   * @param booter
   */
  public use(booter: Booter) {
    this.registers.push(booter);
  }

  /**
   * 注册组件
   * @param constructor
   */
  public register(constructor: any): void {
    // 有效性检测
    if (!constructor) return;
    if (typeof constructor !== "function") return;

    // 避免重复注册
    if (this.registereds.includes(constructor)) {
      return;
    } else {
      this.registereds.push(constructor);
    }

    // 注册组件
    super.register(constructor);

    // 注册注册器
    if (isRegister(constructor)) {
      this.registers.push(constructor);
    }

    // 注册启动器
    if (isBooter(constructor)) {
      this.booters.push(constructor);
    }
  }

  /**
   * 验证文件
   * @param path
   */
  protected checkFile(path: string): boolean {
    if (this.scanFiles.includes(path)) return false;
    this.scanFiles.push(path);
    if (!fs.statSync(path).isFile()) return false;
    if (lodash.endsWith(path, ".d.ts")) return false;
    if (lodash.endsWith(path, ".ts")) return true;
    if (lodash.endsWith(path, ".js")) return true;
    return false;
  }

  /**
   * 扫描自动载入
   * @param dir
   */
  public scan(dir: string) {
    const stack = callsite()[1].getFileName();
    const pattern = join(dirname(stack), dir);
    const paths = glob.sync(pattern);
    for (const path of paths) {
      if (!this.checkFile(path)) continue;
      const required = require(path);
      for (const key in required) {
        const target = required[key];
        if (typeof target !== "function") continue;
        this.register(target);
      }
    }
  }

  /**
   * 启动项目
   */
  public async start(): Promise<any> {
    // 避免重复执行
    if (this.startAt) return;
    this.startAt = new Date();

    // 容器初始化
    this.init();

    // 系统中间件
    await composeHandler([...this.registers], this);
    await composeHandler([...this.booters], this);

    // 记录启动日志
    const logger = this.get<ILogger>(LoggerBean.ID);
    const time = Date.now() - this.createdAt.getTime();
    logger.info("应用启动完成, 耗时", time, "毫秒");

    // 启动完成执行
    if (this.afterStarted instanceof Function) {
      await this.afterStarted();
    }
  }
}
