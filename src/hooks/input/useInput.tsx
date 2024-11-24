import { isFunction, isNil, isNumber } from "lodash";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
  ChangeEvent,
} from "react";
import { isAsyncFunction } from "src/utils/general";

const useInput = (
  onInputUpdate?: (inputValue: string, ...args: any) => void | number,
  cancelInputUpdate?: (
    newValue: string,
    currInputValue?: string,
    ...args: any
  ) => boolean,
  inputEffectTriggerFunction?: (...args: any) => any,
  customInputState?: string,
  /* TODO - FIX */
  customInputSetter?:
    | Dispatch<SetStateAction<string>>
    | ((value: string) => void)
): [string, (e: ChangeEvent<HTMLInputElement>) => void] => {
  const [input, setInput] = useState<string>("");

  const updateInputValue = isFunction(customInputSetter)
    ? customInputSetter
    : setInput;
  const inputValue = !isNil(customInputState) ? customInputState : input;

  const shouldCancelInputUpdate = useCallback(
    (newValue: string) =>
      isFunction(cancelInputUpdate) && cancelInputUpdate(newValue, inputValue),
    [customInputState, input]
  );

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (shouldCancelInputUpdate(newValue)) {
      e.preventDefault();
      return;
    }
    updateInputValue(e.target.value);
    isFunction(onInputUpdate) && onInputUpdate(e.target.value);
  };

  useEffect(() => {
    let timeoutId: number | undefined;
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
