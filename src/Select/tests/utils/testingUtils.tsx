import { SelectProps } from "src/Select/types/selectComponentTypes";

export type DefaultSelectProps = {
  useAsync: boolean;
  isMultiValue: boolean;
  closeDropdownOnSelect?: boolean;
  clearValueOnInputChange?: boolean;
  clearInputOnIdicatorClick?: boolean;
  clearInputOnSelect?: boolean;
  labelKey: string;
  categoryKey: string;
  isCategorized: boolean;
  recordsPerPage: number;
  removeSelectedOptionsFromList?: boolean;
  fetchOnScroll: boolean;
  lazyInit: boolean;
  hasInput: boolean;
};

export const defaultSelectProps: DefaultSelectProps = {
  useAsync: false,
  isMultiValue: false,
  hasInput: true,

  labelKey: "name",
  categoryKey: "category",
  isCategorized: false,
  recordsPerPage: 20,
  fetchOnScroll: false,
  lazyInit: false,
};

export const SINGLE_VALUE_TESTID = "select-single-value";
export const MULTI_VALUE_TESTID = "select-multi-value";
export const MULTI_VALUE_CLEAR_TESTID = "select-multi-value-clear";
export const SELECT_TOP_TESTID = "select-top";
export const SELECT_INPUT_TESTID = "select-input";
export const SELECT_OPTION_TESTID = "select-option";
export const SELECT_CLEAR_INDICATOR_TESTID = "select-clear-indicator";
