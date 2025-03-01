import { Dispatch, SetStateAction } from "react";

import {
  SelectOptionList,
  SelectOptionT,
  SelectFocusNavigationFallbackDirection,
  OptionHoverHandler,
  PreventInputUpdate,
  DefaultSelectEventHandlers,
  CategorizedSelectOptions,
  SelectDomRefs,
  SelectKeyboardNavigationDirection,
} from "src/Select/types/selectGeneralTypes";

export type StateSetter<T> = Dispatch<SetStateAction<T>> | ((arg: T) => void);

export type SelectState = {
  value: SelectOptionList | [];
  selectOptions: SelectOptionList | [];
  isOpen: boolean;
  inputValue: string;
  page: number;
};

export type SelectStateUpdaters = {
  setInputValue: (inputValue: string) => void;
  toggleDropdownVisibility: () => void;
  selectValue: (option: SelectOptionT) => void;
  addOptions: (options: SelectOptionList) => void;
  openDropdown: () => void;
  closeDropdown: () => void;
  resetPage: () => void;
  loadNextPage: () => void;
  clearInput: () => void;
  setSelectOptions: (options: SelectOptionList) => void;
  clearAllValues: () => void;
  clearValue: (optionId: keyof SelectOptionT) => void;
};

export type SelectFocusState = {
  focusedOptionIndex: number | null;
  focusedOptionCategory: keyof SelectOptionT;
};

export type SelectApi = {
  selectState: SelectState;
  selectStateUpdaters: SelectStateUpdaters;
  selectFocusState: SelectFocusState;
  selectFocusHandlers: SelectFocusHandlers;
  handleOptionsSearchTrigger: () => void;
  onDropdownExpand: () => void;
  usesInputAsync: boolean;
  isLastPage: () => boolean;
  preventInputUpdate: PreventInputUpdate;
  selectEventHandlers: DefaultSelectEventHandlers;
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  getOriginalOptions: () => SelectOptionList;
  setOriginalOptions: (options: SelectOptionList) => void;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  closeDropdownOnSelect: boolean;
  focusInput: () => void;
  selectDomRefs: SelectDomRefs;
  handlePageReset: () => void;
  clearInputOnSelect: boolean;
  loadNextPage: () => void;
  filterSearchedOptions: () => void;
};

export type SelectAsyncApi = {
  isLastPage: () => boolean;
  isInitialFetch: () => boolean;
  fetchOnScrollToBottom: boolean | undefined;
  loadNextPageAsync: () => void;
};

export type SelectFocusHandlers = {
  focusNextOption: (
    fallbackDirection?: SelectFocusNavigationFallbackDirection
  ) => void;
  focusPreviousOption: () => void;
  handleOptionFocusOnSelectByClick: (
    focusedOptionIdx: number,
    focusedCategory: string,
    direction?: SelectKeyboardNavigationDirection,
    fallbackDirection?: SelectFocusNavigationFallbackDirection
  ) => void;
  handleOptionFocusOnSelectByKeyPress: (
    direction: SelectKeyboardNavigationDirection,
    fallbackDirection: SelectFocusNavigationFallbackDirection
  ) => void;
  handleOptionHover: OptionHoverHandler;
  setFocusedOptionIndex: StateSetter<number>;
  setFocusedOptionCategory: StateSetter<string>;
  setFocusOnHover: (optionIdx: number, optionCategory: string) => void;
  isOptionFocused: (option: SelectOptionT, optionIdx: number) => boolean;
  getFocusedOption: () => SelectOptionT | void;
  resetFocus: () => void;
};

export type SelectFocusApi = {
  selectFocusState: SelectFocusState;
  selectFocusHandlers: SelectFocusHandlers;
};

export type CustomStateSetters = {
  setValue: StateSetter<SelectOptionList>;
  customSetInputValue: StateSetter<string> | undefined;
  customSetSelectOptions: StateSetter<SelectOptionList> | undefined;
  customSetIsOpen: StateSetter<boolean> | undefined;
  customSetPage: StateSetter<number> | undefined;
};

export type CustomState = {
  customInputValue: string | undefined;
  customSelectOptions: SelectOptionList | undefined;
  customIsOpen: boolean | undefined;
  customPage: number | undefined;
};
