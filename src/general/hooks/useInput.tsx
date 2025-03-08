import { isFunction, isNil, isNumber } from "lodash";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  ChangeEvent,
  useRef,
} from "react";
import { isAsyncFunction } from "src/general/utils/general";

const useInput = (
  onInputUpdate?: (inputValue: string, ...args: any) => void | number,
  cancelInputUpdate?: (
    e: ChangeEvent<HTMLInputElement>,
    newValue: string,
    currInputValue?: string,
    ...args: any
  ) => boolean,
  inputEffectTriggerFunction?: (...args: any) => any,
  customInputState?: string
): [string, (e: ChangeEvent<HTMLInputElement>) => void] => {
  const [input, setInput] = useState<string>("");

  const isInitialRef = useRef(true);

  const inputValue = !isNil(customInputState) ? customInputState : input;

  const shouldCancelInputUpdate = useCallback(
    (e: ChangeEvent<HTMLInputElement>, newValue: string) =>
      isFunction(cancelInputUpdate) &&
      cancelInputUpdate(e, newValue, inputValue),
    [inputValue, cancelInputUpdate]
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (shouldCancelInputUpdate(e, newValue)) {
      e.preventDefault();
      return;
    }
    isFunction(onInputUpdate)
      ? onInputUpdate(e.target.value)
      : setInput(inputValue);
  };

  useEffect(() => {
    let timeoutId: number | undefined;
    if (isInitialRef.current) {
      isInitialRef.current = false;
    } else {
      if (isFunction(inputEffectTriggerFunction)) {
        if (isAsyncFunction(inputEffectTriggerFunction)) {
          (async () => {
            timeoutId = await inputEffectTriggerFunction(inputValue);
          })();
        } else {
          timeoutId = inputEffectTriggerFunction(inputValue);
        }
      }
    }

    if (isNumber(timeoutId)) {
      return () => clearTimeout(timeoutId);
    }
  }, [inputValue]);

  return [inputValue, onInputChange];
};

export default useInput;
