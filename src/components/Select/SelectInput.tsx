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
  isMultiValue: boolean;
  onInputChange: (inputValue: string) => void;
  inputValue: string;
  labelKey: keyof SelectOptionT;
  filterSearchedOptions: () => void;
  focusNextOption: (
    fallbackDirection?: SelectFocusNavigationFallbackDirection
  ) => void;
  focusPreviousOption: () => void;
  addOptionOnKeyPress: () => void;
  useInputAsync: boolean;
  hasInput: boolean;
  handleOptionsSearchTrigger: () => void;
  disableInputFetchTrigger: boolean;
  preventInputUpdate: PreventInputUpdate;
  isLoading?: boolean;
  hasPaging?: boolean;
  renderInputContainerForCustomComponent?: boolean;
};

const SelectInput = memo(
  forwardRef<HTMLInputElement, SelectInputProps>((props, ref) => {
    const {
      isMultiValue,
      onInputChange,
      inputValue,
      handleOptionsSearchTrigger,
      focusNextOption,
      focusPreviousOption,
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

    const setInput = (value: string) => {
      const { setInputValue } = getSelectStateSetters();
      setInputValue(value);
    };
    const className = clsx({
      select__input: true,
      hidden: !hasInput,
    });

    useImperativeHandle(ref, () => innerRef.current!, []);

    const onInputUpdate = useCallback(
      (input: string) => {
        const { openDropdown, clearAllValues } = getSelectStateSetters();
        openDropdown();
        // TODO ADD CUSTOM PROP
        !isMultiValue && clearAllValues();
        isFunction(onInputChange) && onInputChange(input);
      },
      [isMultiValue, onInputChange]
    );

    const [_, handleInputChange] = useInput(
      onInputUpdate,
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
