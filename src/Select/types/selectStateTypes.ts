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
} from "src/Select/types/selectGeneralTypes";

export type StateSetter<T> = Dispatch<SetStateAction<T>> | ((arg: T) => void);

export type SelectState = {
  value: SelectOptionList | [];
  selectOptions: SelectOptionList | [];
  isOpen: boolean;
  inputValue: string;
  page: number;
  focusedOptionId: string;
  focusedCategory?: keyof SelectOptionT;
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

type SelectFocusState = {
  focusedOptionIndex: number | null;
  focusedOptionCategory: keyof SelectOptionT;
};

export type SelectApi = {
  handleOptionsSearchTrigger: () => void;
  onDropdownExpand: () => void;
  usesInputAsync: boolean;
  preventInputUpdate: PreventInputUpdate;
  selectEventHandlers: DefaultSelectEventHandlers;
  fetchOnScrollToBottom: boolean | undefined;
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

export type SelectFocusApi = {
  selectFocusState: SelectFocusState;
  selectFocusHandlers: {
    focusNextOption: (
      fallbackDirection?: SelectFocusNavigationFallbackDirection
    ) => void;
    focusPreviousOption: () => void;
    handleOptionFocusOnSelectByClick: (
      focusedOptionIdx: number,
      focusedCategory: string
    ) => void;
    handleOptionFocusOnSelectByKeyPress: () => void;
    handleOptionHover: OptionHoverHandler;
    setFocusOnHover: (optionIdx: number, optionCategory: string) => void;
    isOptionFocused: (option: SelectOptionT, optionIdx: number) => boolean;
    getFocusedOption: () => SelectOptionT | void;
    resetFocus: () => void;
  };
};
