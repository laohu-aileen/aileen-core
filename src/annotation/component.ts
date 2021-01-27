import { Annotation } from "aileen-annotation";
import { ID } from "../standard/basic";

/**
 * 组件声明
 */
export interface ComponentOption {
  id?: ID<any>;
  scope?: "singleton" | "prototype" | "session";
  lazy?: boolean;
  tags?: Array<string | symbol>;
}

/**
 * 组件注解
 */
export const ComponentAnnotation = new Annotation<ComponentOption>();

/**
 * 组件注解
 * @param id
 */
export const Component = (id?: ID<any>): ClassDecorator =>
  ComponentAnnotation.decorator({ id });

/**
 * 作用域模式
 * @param mode
 */
export const Scope = (
  mode: "singleton" | "prototype" | "session"
): ClassDecorator => ComponentAnnotation.decorator({ scope: mode });

/**
 * 懒加载
 * @param status
 */
export const Lazy = (status: boolean): ClassDecorator =>
  ComponentAnnotation.decorator({ lazy: status });
