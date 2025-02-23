import { debounce, isFunction, isNil } from "lodash";

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
  isFunction(fn) && fn?.constructor?.name === "AsyncFunction";

export const resolveStateValue = <T>(
  defaultStateValue: T,
  customStateValue: T | undefined | null
): T => (!isNil(customStateValue) ? customStateValue : defaultStateValue);
