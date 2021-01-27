import { Booter } from "../standard/application";
import { Component } from "../annotation/component";
import { Autowride } from "../annotation/autowride";
const RegisterID = Symbol("RegisterID");
const BooterID = Symbol("BooterID");

/**
 * 声明注册器
 * @param booter
 */
export const declareRegister = (booter: Booter): Booter => {
  booter[RegisterID] = true;
  return booter;
};

/**
 * 注册器判断
 * @param booter
 */
export const isRegister = (booter: Booter): boolean => {
  return !!booter[RegisterID];
};

/**
 * 声明启动器
 * @param booter
 */
export const declareBooter = (booter: Booter): Booter => {
  booter[BooterID] = true;
  return booter;
};

/**
 * 启动器判断
 * @param booter
 */
export const isBooter = (booter: Booter): boolean => {
  return !!booter[BooterID];
};

/**
 * 申明BEAN
 * @param name
 */
export const declareBean = (
  name?: string
): {
  ID: symbol;
  Injector: PropertyDecorator & MethodDecorator;
  Component: ClassDecorator;
} => {
  const ID = Symbol(name);
  return {
    Component: Component(ID),
    Injector: Autowride(ID),
    ID,
  };
};
