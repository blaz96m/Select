import { SelectState } from "src/Select/types/selectStateTypes";

export const DEFAULT_SELECT_PLACEHOLDER = "Please select a value";

export const INITIAL_STATE: SelectState = {
  isOpen: false,
  value: [],
  selectOptions: [],
  inputValue: "",
  page: 1,
};

export const OPTIONS_EMPTY_TEXT = "No Options Found";

export const NO_CATEGORY_KEY = "The Category Key was not provided";

export const FALLBACK_CATEGORY_NAME = "Other";
