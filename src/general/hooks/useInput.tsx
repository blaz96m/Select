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
    (newValue: string) =>
      isFunction(cancelInputUpdate) && cancelInputUpdate(newValue, inputValue),
    [customInputState, input, cancelInputUpdate]
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (shouldCancelInputUpdate(newValue)) {
      e.preventDefault();
      return;
    }
    isFunction(onInputUpdate)
      ? onInputUpdate(e.target.value)
      : setInput(inputValue);
  };

  useEffect(() => {
    if (isInitialRef.current) {
      isInitialRef.current = false;
      return;
    }
    let timeoutId: number | undefined;
    // TODO ADD STATE RESOLVER
    const inputState = !isNil(customInputState) ? customInputState : input;
    if (!isFunction(inputEffectTriggerFunction)) {
      return;
    }
    if (isAsyncFunction(inputEffectTriggerFunction)) {
      (async () => {
        timeoutId = await inputEffectTriggerFunction(inputState);
      })();
    } else {
      timeoutId = inputEffectTriggerFunction(inputState);
    }
    if (isNumber(timeoutId)) {
      return () => clearTimeout(timeoutId);
    }
  }, [input, customInputState]);

  return [input, onInputChange];
};

export default useInput;
