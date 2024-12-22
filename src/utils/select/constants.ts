import { SelectState } from "src/components/Select/types/selectTypes";

export const DEFAULT_SELECT_PLACEHOLDER = "Please select a value";

export const INITIAL_STATE: SelectState = {
  isOpen: false,
  value: [],
  selectOptions: [],
  inputValue: "",
  page: 1,
  focusedCategory: "",
  focusedOptionId: "",
};

export const OPTIONS_EMPTY_TEXT = "No Options Found";
