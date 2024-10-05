import { debounce, isFunction } from "lodash";

type DebouncedFunction<T extends any[]> = (...args: T) => Promise<any>;

export const debounceAsync = <T extends any[]>(
  func: (...args: T) => any,
  wait: number
): DebouncedFunction<T> => {
  const debounced = debounce((resolve: (value: any) => void, ...args: T) => {
    resolve(func(...args));
  }, wait);

  return (...args: T): Promise<any> => {
    return new Promise<any>((resolve) => {
      debounced(resolve, ...args);
    });
  };
};

export const isAsyncFunction = (fn: () => any) =>
  isFunction(fn) && fn.prototype.name === "AsyncFunction";
