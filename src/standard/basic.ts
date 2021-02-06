/**
 * 中间件Next
 */
export type Next = () => Promise<any>;

/**
 * 可实力化类型
 */
export interface Newable<T> {
  new (...args: any[]): T;
}

/**
 * 抽象类类型
 */
export interface Abstract<T> {
  prototype: T;
}

/**
 * 组件唯一标识
 */
export type ID<T = any> = string | symbol | Newable<T> | Abstract<T>;
