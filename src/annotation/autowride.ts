import { Annotation } from "aileen-annotation";
import { ID } from "../standard/basic";

/**
 * 注入注解
 */
export const AutowrideAnnotation = new Annotation<{
  ids?: ID<any>[];
}>();

/**
 * 自动解析注解
 * @param id
 */
export const Autowride = (
  ...ids: ID<any>[]
): PropertyDecorator & MethodDecorator =>
  AutowrideAnnotation.decorator({ ids });

/**
 * 环境变量注入注解
 */
export const EnvAnnotation = new Annotation<{
  key?: string;
}>();

/**
 * 解析环境变量注解
 * @param id
 */
export const Env = (key?: string): PropertyDecorator =>
  EnvAnnotation.decorator({ key });

/**
 * 配置注入注解
 */
export const ValueAnnotation = new Annotation<{
  key?: string | symbol;
}>();

/**
 * 解析配置对象注解
 * @param id
 */
export const Value = (key?: string | symbol): PropertyDecorator =>
  ValueAnnotation.decorator({ key });
