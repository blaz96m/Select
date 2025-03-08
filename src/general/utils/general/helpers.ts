import { isFunction, isNil } from "lodash";

export const isAsyncFunction = (fn: () => any) =>
  isFunction(fn) && fn?.constructor?.name === "AsyncFunction";

export const resolveStateValue = <T>(
  defaultStateValue: T,
  customStateValue: T | undefined | null
): T => (!isNil(customStateValue) ? customStateValue : defaultStateValue);
