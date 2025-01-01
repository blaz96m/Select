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
  SelectFocusDetails,
  SelectStateSetters,
  CustomSelectInputRenderer,
  SelectComponents,
  SelectInputInnerProps,
} from "src/components/Select/types";
import { useInput } from "src/hooks/input";
import {
  generateComponentInnerProps,
  isDirectionBottom,
} from "src/utils/select";
import clsx from "clsx";
import { SelectAsyncStateSetters } from "src/hooks/select/useSelectAsync";

export type SelectInputProps = {
  isMultiValue: boolean;
  customOnChange?: (inputValue?: string) => {};
  inputValue: string;
  labelKey: keyof SelectOptionT;
  filterSearchedOptions: () => void;
  getSelectStateSetters: () => SelectStateSetters;
  getFocusValues: (
    direction: SelectKeyboardNavigationDirection
  ) => SelectFocusDetails | null;
  focusFirstOption: () => void;
  focusLastOption: () => void;
  onKeyPress: (id: string) => void;
  addOptionOnKeyPress: () => void;
  setInput: (value: string) => void;
  usesInputAsync: boolean;
  hasInput: boolean;
  disableInputFetchTrigger: boolean;
  handlePageChange: () => void;
  isLoading?:boolean;
  hasPaging?: boolean;
  renderInputContainerForCustomComponent?: boolean;
};

const SelectInput = memo(
  forwardRef<
    HTMLInputElement,
    SelectInputProps & { customComponent?: CustomSelectInputRenderer }
  >((props, ref) => {
    const {
      isMultiValue,
      customOnChange,
      inputValue,
      getSelectStateSetters,
      getFocusValues,
      focusLastOption,
      focusFirstOption,
      filterSearchedOptions,
      usesInputAsync,
      onKeyPress,
      hasInput,
      addOptionOnKeyPress,
      customComponent,
      setInput,
      handlePageChange,
      hasPaging,
      isLoading,
      renderInputContainerForCustomComponent = true,
    } = props;
    const innerRef = useRef<HTMLInputElement>(null);
    console.log()

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
      if(isFunction(filterSearchedOptions)) {
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

    const onArrowKeyUp = () => {
      const selectStateSetters = getSelectStateSetters();
      const focusDetails = getFocusValues("up");
      if (!isEmpty(focusDetails)) {
        selectStateSetters.setFocusDetails(
          focusDetails.focusedOptionId,
          focusDetails.focusedCategory
        );
        return focusDetails.focusedOptionId;
      }
      const optionId = focusLastOption();
      return optionId;
    };

    const onArrowKeyDown = () => {
      const selectStateSetters = getSelectStateSetters();
      const focusDetails = getFocusValues("down");
      if (!isEmpty(focusDetails)) {
        selectStateSetters.setFocusDetails(
          focusDetails.focusedOptionId,
          focusDetails.focusedCategory
        );
        return focusDetails.focusedOptionId;
      }
      if (hasPaging) {
        return handlePageChange()
      }
      const optionId = focusFirstOption();
      return optionId;
    };

    const handleArrowKeyPress = (
      direction: SelectKeyboardNavigationDirection
    ) => {
      const optionId = isDirectionBottom(direction)
        ? onArrowKeyDown()
        : onArrowKeyUp();
      optionId && onKeyPress(optionId);
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.code) {
        case "ArrowUp":
          handleArrowKeyPress("up");
          break;
        case "ArrowDown":
          handleArrowKeyPress("down");
          break;
        case "Enter":
          addOptionOnKeyPress();
          break;
      }
    };

    if (isFunction(customComponent)) {
      const inputInnerProps = generateComponentInnerProps(
        SelectComponents.INPUT,
        { handleInputChange, className, inputValue, innerRef, handleKeyPress, isLoading }
      );
      return renderInputContainerForCustomComponent ? (
        <div className="select__input__wrapper">
          {customComponent(props, inputInnerProps as SelectInputInnerProps)}
        </div>
      ) : (
        customComponent(props, inputInnerProps as SelectInputInnerProps)
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
