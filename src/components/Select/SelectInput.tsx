import {
  useCallback,
  memo,
  KeyboardEvent,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { hasIn, isEmpty, isFunction, trim } from "lodash";
import {
  SelectOptionList,
  SelectOptionT,
  SelectKeyboardNavigationDirection,
  SelectStateSetters,
  CustomSelectInputRenderer,
  SelectComponents,
  SelectInputInnerProps,
  SelectFocusNavigationFallbackDirection,
  CustomPreventInputUpdate,
  PreventInputUpdate,
} from "src/components/Select/types";
import { useInput } from "src/hooks/input";
import { generateComponentInnerProps } from "src/utils/select";
import clsx from "clsx";

import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectInputProps = {
  onInputChange: (inputValue: string) => void;
  inputValue: string;
  focusNextOption: (
    fallbackDirection?: SelectFocusNavigationFallbackDirection
  ) => void;
  focusPreviousOption: () => void;
  addOptionOnKeyPress: () => void;
  setInput: (inputValue: string) => void;
  hasInput: boolean;
  handleOptionsSearchTrigger: () => void;
  disableInputFetchTrigger: boolean;
  preventInputUpdate: PreventInputUpdate;
  isLoading?: boolean;
};

const SelectInput = memo(
  forwardRef<HTMLInputElement, SelectInputProps>((props, ref) => {
    const {
      inputValue,
      handleOptionsSearchTrigger,
      onInputChange,
      focusNextOption,
      focusPreviousOption,
      setInput,
      preventInputUpdate,
      hasInput,
      addOptionOnKeyPress,
      isLoading,
    } = props;
    const innerRef = useRef<HTMLInputElement>(null);

    const selectContext = useSelectContext();
    const {
      components: { SelectInputElement: customComponentProperties },
      getSelectStateSetters,
    } = selectContext;

    const className = clsx({
      select__input: true,
      hidden: !hasInput,
    });

    useImperativeHandle(ref, () => innerRef.current!, []);

    const [_, handleInputChange] = useInput(
      onInputChange,
      preventInputUpdate,
      handleOptionsSearchTrigger,
      inputValue,
      setInput
    );

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.code) {
        case "ArrowUp":
          focusPreviousOption();
          break;
        case "ArrowDown":
          focusNextOption();
          break;
        case "Enter":
          addOptionOnKeyPress();
          break;
      }
    };

    if (isFunction(customComponentProperties?.customComponent)) {
      const inputInnerProps = generateComponentInnerProps(
        SelectComponents.INPUT,
        {
          handleInputChange,
          className,
          inputValue,
          innerRef,
          handleKeyPress,
          isLoading,
        }
      );
      return customComponentProperties.renderContainer ? (
        <div className="select__input__wrapper">
          {customComponentProperties.customComponent(
            { ...props, getSelectStateSetters },
            inputInnerProps as SelectInputInnerProps
          )}
        </div>
      ) : (
        customComponentProperties.customComponent(
          { ...props, getSelectStateSetters },
          inputInnerProps as SelectInputInnerProps
        )
      );
    }

    return (
      <div className="select__input__wrapper">
        <input
          key="select-input"
          className={className}
          onChange={handleInputChange}
          value={inputValue}
          disabled={isLoading}
          onKeyDown={handleKeyPress}
          ref={innerRef}
        />
      </div>
    );
  })
);

export default SelectInput;
