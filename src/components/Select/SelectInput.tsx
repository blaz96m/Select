import {
  useCallback,
  memo,
  KeyboardEvent,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { isEmpty, isFunction, trim } from "lodash";
import {
  SelectOptionList,
  SelectOptionT,
  SelectKeyboardNavigationDirection,
  SelectStateSetters,
  CustomSelectInputRenderer,
  SelectComponents,
  SelectInputInnerProps,
  SelectFocusNavigationFallbackDirection,
} from "src/components/Select/types";
import { useInput } from "src/hooks/input";
import { generateComponentInnerProps } from "src/utils/select";
import clsx from "clsx";
import { SelectAsyncStateSetters } from "src/hooks/select/useSelectAsync";
import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectInputProps = {
  isMultiValue: boolean;
  customOnChange?: (inputValue?: string) => {};
  inputValue: string;
  labelKey: keyof SelectOptionT;
  filterSearchedOptions: () => void;
  focusNextOption: (
    fallbackDirection?: SelectFocusNavigationFallbackDirection
  ) => void;
  focusPreviousOption: () => void;
  addOptionOnKeyPress: () => void;
  usesInputAsync: boolean;
  hasInput: boolean;
  disableInputFetchTrigger: boolean;
  isLoading?: boolean;
  hasPaging?: boolean;
  renderInputContainerForCustomComponent?: boolean;
};

const SelectInput = memo(
  forwardRef<HTMLInputElement, SelectInputProps>((props, ref) => {
    const {
      isMultiValue,
      customOnChange,
      inputValue,
      filterSearchedOptions,
      focusNextOption,
      focusPreviousOption,
      usesInputAsync,
      hasInput,
      addOptionOnKeyPress,
      hasPaging,
      isLoading,
    } = props;
    const innerRef = useRef<HTMLInputElement>(null);

    const selectContext = useSelectContext();
    const {
      components: { SelectInputElement: customComponentProperties },
      getSelectAsyncStateSetters,
      getSelectStateSetters,
    } = selectContext;

    const setInput = (value: string) => {
      const { setSearchQuery } = getSelectAsyncStateSetters();
      const { setInputValue } = getSelectStateSetters();
      usesInputAsync ? setSearchQuery(value) : setInputValue(value);
    };

    const shouldPreventInputChange = useCallback(
      (updatedValue: string) =>
        (!trim(updatedValue) && !inputValue) || !hasInput,
      [inputValue]
    );

    const className = clsx({
      select__input: true,
      hidden: !hasInput,
    });

    useImperativeHandle(ref, () => innerRef.current!, []);

    const onInputUpdate = useCallback(
      (input: string) => {
        const { openDropdown, clearAllValues } = getSelectStateSetters();
        openDropdown();
        !isMultiValue && clearAllValues();
        isFunction(customOnChange) && customOnChange(input);
      },
      [isMultiValue]
    );

    function filterSearchedValues(inputValue: string) {
      if (usesInputAsync) return;
      if (isFunction(filterSearchedOptions)) {
        if (!inputValue) {
          // TODO Check if this is a potential problem for the use effect
          return filterSearchedOptions();
        }
        const timeoutId = setTimeout(() => {
          filterSearchedOptions();
        }, 1000);
        return timeoutId;
      }
    }

    const [_, handleInputChange] = useInput(
      onInputUpdate,
      shouldPreventInputChange,
      filterSearchedValues,
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
            { ...props, getSelectStateSetters, getSelectAsyncStateSetters },
            inputInnerProps as SelectInputInnerProps
          )}
        </div>
      ) : (
        customComponentProperties.customComponent(
          { ...props, getSelectStateSetters, getSelectAsyncStateSetters },
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
