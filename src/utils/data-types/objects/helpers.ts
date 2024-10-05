import {
  each,
  has,
  isArray,
  isObject,
  isString,
  isNumber,
  isBoolean,
} from "lodash";

export const concatObjects = (
  obj1: { [key: string]: any },
  obj2: { [key: string]: any }
) => {
  const result = { ...obj1 };
  each(obj2, (value, key) => {
    if (has(result, key)) {
      const currValue = result[key];
      result[key] = concatProperty(currValue, value);
      return;
    }
    result[key] = value;
  });
  return result;
};

const concatProperty = (firstProp: any, secondProp: any) => {
  if (isArray(secondProp) && isArray(firstProp))
    return [...firstProp, ...secondProp];
  if (isObject(secondProp) && isObject(firstProp))
    return concatObjects(firstProp, secondProp);
  if (isString(secondProp) || isNumber(secondProp))
    return firstProp + secondProp;
  if (isBoolean(secondProp) && isBoolean(firstProp)) return secondProp;
  throw new Error("Properties do not match");
};

export const getObjectKeys = (obj: { [key: string]: any }) => {
  return Object.keys(obj);
};
