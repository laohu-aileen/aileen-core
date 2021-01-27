import { ID, Newable } from "../standard/basic";
import { Container } from "../standard/container";
import { BeanBinder } from "./BeanBinder";
import { AutowrideAnnotation, ValueAnnotation } from "../annotation/autowride";
import { ComponentAnnotation } from "../annotation/component";
import {
  ConfigurationComponentID,
  EnableAnnotation,
  BeanAnnotation,
} from "../annotation/configuration";
import { env } from "process";
import { SysConfigBean } from "../injector";
import { Config } from "../application/Config";

/**
 * 容器管理对象
 */
export class AppContext implements Container {
  /**
   * 绑定表
   */
  protected binds: Map<ID, BeanBinder> = new Map();

  /**
   * 是否启动
   */
  protected inited: boolean = false;

  /**
   * 父容器
   */
  protected parent: AppContext;

  /**
   * 会话对象
   */
  public readonly session: Map<ID, any>;

  /**
   * 注册依赖
   */
  constructor(parent?: AppContext) {
    if (!parent) return;
    this.parent = parent;
    this.session = new Map();
  }

  /**
   * 获取绑定器
   * @param id
   */
  public getBinder<T>(id: ID<T>): BeanBinder<T> {
    const binder = this.binds.get(id);
    if (binder !== undefined) return binder;
    if (!this.parent) return null;
    return this.parent.getBinder(id);
  }

  /**
   * 注册依赖
   * @param id
   */
  public bind<T>(id: ID<T>): BeanBinder<T> {
    // 重复声明
    if (this.binds.has(id)) {
      throw new Error(id.toString() + " has bind");
    }

    // 已有绑定
    const oldBinder = this.getBinder(id);

    // 创建绑定
    const binder = new BeanBinder(id);
    this.binds.set(id, binder);

    // 替换父绑定
    if (oldBinder) {
      this.binds.forEach((item, key) => {
        if (item !== oldBinder) return;
        this.binds.set(key, binder);
      });
    }

    // 响应绑定
    return binder;
  }

  /**
   * 设置别名
   * @param id
   * @param newId
   */
  public alias(id: ID, newId: ID): void {
    // 重复声明
    if (this.binds.has(newId)) {
      throw new Error(id.toString() + " has bind");
    }

    // ID未绑定
    const binder = this.getBinder(id);
    if (!binder) throw new Error(id.toString() + " has not bind");

    // 绑定为别名
    this.binds.set(newId, binder);
  }

  /**
   * 接触绑定
   * @param id
   */
  public unbind(id: ID): void {
    this.binds.delete(id);
  }

  /**
   * 是否有依赖
   * @param id
   */
  public has(id: ID<any>): boolean {
    if (this.binds.has(id)) return true;
    if (!this.parent) return false;
    return this.parent.has(id);
  }

  /**
   * 读取依赖
   * @param id
   */
  public get<T>(id: ID<T>): T {
    const binder = this.getBinder<T>(id);
    if (!binder) throw new Error(id.toString() + " has not bind");
    return binder.get(this);
  }

  /**
   * 通过TAG获取BEAN
   * @param tag
   */
  protected getBeansByTag(tag: symbol | string): BeanBinder[] {
    const res: BeanBinder[] = [];
    this.binds.forEach((bean) => {
      if (!bean.tags.includes(tag)) return;
      res.push(bean);
    });
    return res;
  }

  /**
   * 通过标签批量获取
   * @param tag
   */
  public getAllByTag(tag: symbol | string): any[] {
    return this.getBeansByTag(tag).map((bean) => bean.get(this));
  }

  /**
   * 通过标签批量获取
   * @param tag
   */
  public getRefsByTag(tag: symbol | string): any[] {
    return this.getBeansByTag(tag).map((bean) => bean.ref);
  }

  /**
   * 创建会话容器
   */
  public createSession(): AppContext {
    if (!this.parent) return new AppContext(this);
    throw new Error("beanFactory is not container");
  }

  /**
   * 解析对象
   * @param obj
   * @param ctx
   */
  public resolve(obj: Object, ctx: Map<ID, any> = new Map()): void {
    // 读取配置
    const config: Config = this.get(SysConfigBean.ID);

    // 配置注入
    for (const { key } of ValueAnnotation.getRefPropertys(obj)) {
      const ref = ValueAnnotation.getRef(obj, key);
      obj[key] = ref.key ? config.get(ref.key) : config;
    }

    for (const { key } of AutowrideAnnotation.getRefPropertys(obj)) {
      // 解析ID
      const { ids } = AutowrideAnnotation.getRef(obj, key);
      const beanId = ids[0] || key;

      // 获取依赖
      const binder = this.getBinder(beanId);
      if (!binder) throw new Error(beanId.toString() + " bean not bind");

      // 进行注入
      obj[key] = binder.get(this, ctx);
    }

    for (const { key } of AutowrideAnnotation.getRefMethods(obj)) {
      // 解析ID
      const { ids } = AutowrideAnnotation.getRef(obj, key);

      // 获取依赖
      const params = ids.map((id) => {
        const binder = this.getBinder(id);
        if (!binder) throw new Error(id.toString() + " bean not bind");
        return binder.get(this, ctx);
      });

      // 执行注入
      obj[key](...params);
    }
  }

  /**
   * 注册组件
   * @param constructor
   */
  public register(constructor: Newable<any>): void {
    // 参数有效性检测
    if (!constructor) return;
    if (typeof constructor !== "function") return;

    // 读取反射数据
    if (!ComponentAnnotation.hasRef(constructor)) return;
    const ref = ComponentAnnotation.getRef(constructor);

    // 绑定构造函数
    const bean = this.bind(constructor);
    bean.toConstructor(constructor);
    if (ref.id) this.alias(constructor, ref.id);

    // 设置附加选项
    if (ref.lazy !== undefined) bean.lazy(ref.lazy);
    if (ref.scope !== undefined) bean.scope(ref.scope);

    // 设置标签
    for (const tag of ref.tags || []) {
      if (bean.tags.includes(tag)) continue;
      bean.tags.push(tag);
    }
  }

  /**
   * 启动容器
   */
  public init(): void {
    // 避免重复执行
    if (this.inited) return;
    this.inited = true;

    // 配置对象实例
    const configurations = this.getAllByTag(ConfigurationComponentID);

    // 注册配置Bean
    for (const configuration of configurations) {
      const beanFactorys = BeanAnnotation.getRefMethods(configuration);
      for (const { key } of beanFactorys) {
        // 启用判定
        const enable = EnableAnnotation.getRef(configuration, key);
        if (enable && !enable.match(env)) continue;

        // 注册配置
        const { id } = BeanAnnotation.getRef(configuration, key);
        const factory = configuration[key].bind(configuration);
        this.bind(id || key).toFactory(factory);
      }
    }
  }
}
