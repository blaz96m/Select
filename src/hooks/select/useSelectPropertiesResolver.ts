import { isFunction, isNil, isNumber, trim } from "lodash";
import { useCallback } from "react";
import {
  CustomPreventInputUpdate,
  SelectFetchFunc,
  SelectFetchFunc,
  SelectState,
} from "src/components/Select/types";
import { NO_CATEGORY_KEY } from "src/utils/select/constants";

type SelectProps = {
  fetchFunction: SelectFetchFunc | undefined;
  fetchOnInputChange: boolean;
  hasInput: boolean;
  disableInputUpdate: boolean;
  customPreventInputUpdate: CustomPreventInputUpdate;
  customClearInputOnSelect: boolean | undefined;
  isMultiValue: boolean;
  fetchOnScroll: boolean | undefined;
  recordsPerPage: number | undefined;
  customCloseDropdownOnSelect: boolean | undefined;
};

const useSelectPropertiesResolver = (
  selectProps: SelectProps,
  selectState: SelectState
) => {
  const {
    fetchFunction,
    fetchOnInputChange,
    hasInput,
    disableInputUpdate,
    customPreventInputUpdate,
    customClearInputOnSelect,
    customCloseDropdownOnSelect,
    fetchOnScroll,
    recordsPerPage,
    isMultiValue,
  } = selectProps;

  const { inputValue } = selectState;

  const usesInputAsync = isFunction(fetchFunction) && fetchOnInputChange;

  const defaultPreventInputUpdate = useCallback(
    (updatedValue: string) => (!trim(updatedValue) && !inputValue) || !hasInput,
    [hasInput, inputValue]
  );
  const preventInputUpdate = useCallback(
    (updatedValue: string) => {
      if (disableInputUpdate) return true;
      if (isFunction(customPreventInputUpdate))
        return customPreventInputUpdate(updatedValue, inputValue);
      return defaultPreventInputUpdate(updatedValue);
    },
    [defaultPreventInputUpdate, customPreventInputUpdate, disableInputUpdate]
  );

  const defaultClearInputOnSelect = isMultiValue ? false : true;

  const clearInputOnSelect = isNil(customClearInputOnSelect)
    ? defaultClearInputOnSelect
    : customClearInputOnSelect;

  const closeDropdownOnSelectDefault = isMultiValue ? false : true;
  const closeDropdownOnSelect = isNil(customCloseDropdownOnSelect)
    ? closeDropdownOnSelectDefault
    : customCloseDropdownOnSelect;

  const fetchOnScrollToBottom = isFunction(fetchFunction) && fetchOnScroll;

  // TODO REMOVE
  const hasPaging =
    fetchOnScrollToBottom || (isNumber(recordsPerPage) && recordsPerPage > 0);

  return {
    usesInputAsync,
    preventInputUpdate,
    closeDropdownOnSelect,
    hasPaging,
    fetchOnScrollToBottom,
    clearInputOnSelect,
  };
};

export default useSelectPropertiesResolver;
