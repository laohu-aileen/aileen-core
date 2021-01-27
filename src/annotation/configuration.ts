import { Annotation } from "aileen-annotation";
import { ComponentAnnotation } from "./component";
import { ID } from "../standard/basic";

/**
 * 配置组件
 */
export const ConfigurationComponentID = Symbol("ConfigurationComponentID");

/**
 * 配置注解
 */
export const ConfigurationAnnotation = new Annotation();
ConfigurationAnnotation.warp(() =>
  ComponentAnnotation.decorator({
    lazy: false,
    scope: "singleton",
    tags: [ConfigurationComponentID],
  })
);

/**
 * 配置注解
 * @param id
 */
export const Configuration = (): ClassDecorator =>
  ConfigurationAnnotation.decorator({});

/**
 * 配置注解
 */
export const BeanAnnotation = new Annotation<{
  id?: ID;
}>();

/**
 * 配置注解
 * @param id
 */
export const Bean = (id?: ID): MethodDecorator =>
  BeanAnnotation.decorator({ id });

/**
 * 配置注解
 */
export const EnableAnnotation = new Annotation<{
  match: (env: { [key: string]: string }) => boolean;
}>();

/**
 * 环境配置
 * @param match
 */
export const Enable = (
  match: ((env: { [key: string]: string }) => boolean) | boolean
): MethodDecorator => {
  if (typeof match !== "boolean") return EnableAnnotation.decorator({ match });
  return EnableAnnotation.decorator({ match: () => match });
};
