import { ID, Newable } from "../standard/basic";
import { AppContext } from "./AppContext";
import { Binder } from "../standard/container";

/**
 * 依赖注入实例
 */
export class BeanBinder<T = any> implements Binder<T> {
  /**
   * 唯一标识
   */
  protected _id: ID;

  /**
   * 作用域
   */
  protected _scope: "singleton" | "prototype" | "session";

  /**
   * 是否懒加载
   */
  protected _lazy: boolean;

  /**
   * 单例缓存
   */
  protected _singleton: T;

  /**
   * 对象生成器
   */
  protected _factory: () => T;

  /**
   * 类型反射
   */
  protected _ref: any;

  /**
   * 获取类型反射
   */
  get ref(): any {
    return this._ref;
  }

  /**
   * 组件标签
   */
  public readonly tags: Array<symbol | string> = [];

  /**
   * 构造方法
   * @param id
   */
  constructor(id: ID) {
    this._id = id;
    this._scope = "singleton";
    this._lazy = false;
  }

  /**
   * 获取对象
   * @param container
   * @param ctx
   */
  public get(container: AppContext, ctx: Map<ID, any> = new Map()): T {
    // 已生成单例
    if (this._singleton !== undefined) return this._singleton;

    // 已在上下文生成
    if (ctx.has(this._id)) return ctx.get(this._id);

    // 会话模式生效
    if (
      this.isSession &&
      container.session &&
      container.session.has(this._id)
    ) {
      return container.session.get(this._id);
    }

    // 创建实例对象
    const obj = this._factory();
    if (this.isSingleton) this._singleton = obj;

    // 标记会话实例
    if (this.isSession && container.session) {
      container.session.set(this._id, obj);
    }

    // 属性注入
    ctx.set(this._id, obj);
    container.resolve(obj, ctx);

    // 响应对象实例
    return obj;
  }

  /**
   * 是否单例
   */
  public get isSingleton(): boolean {
    return this._scope === "singleton";
  }

  /**
   * 是否多例
   */
  public get isPrototype(): boolean {
    return this._scope === "prototype";
  }

  /**
   * 是否多例
   */
  public get isSession(): boolean {
    return this._scope === "session";
  }

  /**
   * 设定作用域
   * @param value
   */
  public scope(value: "singleton" | "prototype" | "session"): this {
    this._scope = value;
    return this;
  }

  /**
   * 是否懒加载
   */
  public get isLazy(): boolean {
    return this._lazy;
  }

  /**
   * 设置懒加载
   * @param value
   */
  public lazy(value: boolean): this {
    this._lazy = value;
    return this;
  }

  /**
   * 绑定到构造类
   * @param constructor
   */
  public toConstructor(value: Newable<T>): this {
    this._ref = value;
    this._factory = () => new value();
    return this;
  }

  /**
   * 绑定动态值
   * @param value
   */
  public toPrototype(value: T): this {
    this._ref = value;
    const constructor: any = function () {};
    constructor.prototype = value;
    this._factory = () => new constructor();
    return this;
  }

  /**
   * 绑定工厂
   * @param fun
   */
  public toFactory(value: () => T): this {
    this._ref = value;
    this._factory = value;
    return this;
  }

  /**
   * 绑定动态值
   * @param value
   */
  public toValue(value: T): this {
    this._ref = value;
    this._factory = () => value;
    return this;
  }
}
