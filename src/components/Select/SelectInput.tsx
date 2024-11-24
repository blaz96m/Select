import {
  useCallback,
  memo,
  KeyboardEvent,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { hasIn, isEmpty, isFunction, noop, trim } from "lodash";
import {
  SelectOptionList,
  SelectOptionT,
  SelectKeyboardNavigationDirection,
  SelectFocusDetails,
} from "src/components/Select/types";
import { SelectApi, SelectStateSetters } from "src/hooks/select/useSelect";
import { useInput } from "src/hooks/input";
import { isDirectionBottom } from "src/utils/select";
import { SelectAsyncApi } from "src/hooks/select/useSelectAsync";
import clsx from "clsx";
import { QueryStateSetters as SelectAsyncStateSetters } from "src/hooks/requests/useQueryManager";

type SelectInputProps = {
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
  getIsLastPage: () => boolean;
  getSelectAsyncStateSetters: () => SelectAsyncStateSetters;
  usesInputAsync: boolean;
  hasInput: boolean;
  disableInputFetchTrigger: boolean;
};

const SelectInput = memo(
  forwardRef<HTMLInputElement, SelectInputProps>(
    (
      {
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
        getSelectAsyncStateSetters,
        getIsLastPage,
      },
      ref
    ) => {
      const innerRef = useRef<HTMLInputElement>(null);

      const shouldPreventInputChange = useCallback(
        (updatedValue: string) => !trim(updatedValue) && !inputValue,
        [inputValue]
      );

      useImperativeHandle(ref, () => innerRef.current!, []);

      const onInputUpdate = useCallback(
        (input: string) => {
          const selectStateSetters = getSelectStateSetters();
          selectStateSetters.openDropdown();
          if (!isMultiValue) {
            selectStateSetters.clearAllValues();
          }
          if (isFunction(customOnChange)) {
            customOnChange(input);
          }
        },
        [isMultiValue]
      );

      function filterSearchedValues(inputValue: string) {
        if (usesInputAsync) return;
        if (!inputValue && isFunction(filterSearchedOptions)) {
          // TODO Check if this is a potential problem for the use effect
          return filterSearchedOptions();
        }
        const timeoutId = setTimeout(() => {
          filterSearchedOptions();
        }, 1000);

        return timeoutId;
      }

      const setInputValue = useCallback((value: string) => {
        usesInputAsync
          ? getSelectAsyncStateSetters().setSearchQuery(value)
          : getSelectStateSetters().setInputValue(value);
      }, []);

      const [_, handleInputChange] = useInput(
        onInputUpdate,
        shouldPreventInputChange,
        filterSearchedValues,
        inputValue,
        setInputValue
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
        const isLastPage = getIsLastPage();
        const selectStateSetters = getSelectStateSetters();
        const focusDetails = getFocusValues("down");
        if (!isEmpty(focusDetails)) {
          selectStateSetters.setFocusDetails(
            focusDetails.focusedOptionId,
            focusDetails.focusedCategory
          );
          return focusDetails.focusedOptionId;
        }
        if (!isLastPage) {
          return selectStateSetters.loadNextPage();
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

      return (
        <div className="select__input__wrapper">
          <input
            className={clsx({
              select__input: true,
              hidden: !hasInput,
            })}
            onChange={hasInput ? handleInputChange : noop}
            value={inputValue}
            onKeyDown={handleKeyPress}
            ref={innerRef}
          />
        </div>
      );
    }
  )
);

export default SelectInput;
