import { ID, Newable } from "./basic";

/**
 * 依赖绑定器
 */
export interface Binder<T> {
  /**
   * 设定作用域
   * @param value
   */
  scope(value: "singleton" | "prototype" | "session"): this;

  /**
   * 设置懒加载
   * @param value
   */
  lazy(value: boolean): this;

  /**
   * 绑定到构造类
   * @param constructor
   */
  toConstructor(value: Newable<T>): this;

  /**
   * 绑定动态值
   * @param value
   */
  toPrototype(value: T): this;

  /**
   * 绑定工厂
   * @param fun
   */
  toFactory(value: () => T): this;

  /**
   * 绑定动态值
   * @param value
   */
  toValue(value: T): this;
}

/**
 * Bean工厂
 */
export interface BeanFactory {
  /**
   * 注册依赖
   * @param id
   */
  bind<T>(id: ID<T>): Binder<T>;

  /**
   * 接触绑定
   * @param id
   */
  unbind(id: ID): void;

  /**
   * 是否注册依赖
   * @param id
   */
  has(id: ID): boolean;

  /**
   * 读取配置
   * @param id
   */
  get<T>(id: ID): T;

  /**
   * 解析对象
   * @param obj
   */
  resolve(obj: Object): void;

  /**
   * 设置别名
   * @param id
   * @param newId
   */
  alias(id: ID, newId: ID): void;
}

/**
 * 依赖管理容器
 */
export interface Container extends BeanFactory {
  /**
   * 创建会话
   */
  createSession(): BeanFactory;

  /**
   * 注册构造函数
   * @param constructor
   */
  register(constructor: Newable<any>): void;

  /**
   * 启动容器
   */
  init(): void;
}
