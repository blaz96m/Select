// #OPTION TYPES

import { ChangeEvent, KeyboardEvent, MouseEvent, RefObject } from "react";
import { StateSetter } from "./selectStateTypes";

export type SelectOptionT = {
  id: string | number;
  [key: string]: any;
};

export type SelectOptionList = SelectOptionT[];

export type CategorizedSelectOptions = { [key: string]: SelectOptionList };

export type SelectCategoryT = {
  categoryName: string;
  categoryOptions: SelectOptionList;
};

// # EVENT HANDLERS

export type CustomInputChangeHandler = (
  e: ChangeEvent<HTMLInputElement>,
  optionList: SelectOptionList,
  value?: SelectOptionList
) => void;

export type InputChangeHandler = (
  e: ChangeEvent<HTMLInputElement>,
  value?: SelectOptionList
) => void;

export type DropdownClickHandler = () => void;

export type ClearIndicatorClickHanlder = (
  e: MouseEvent<HTMLDivElement>
) => void;

export type ValueClearClickHandler = (
  /* eslint-disable-next-line*/
  e: React.MouseEvent<HTMLDivElement>,
  /* eslint-disable-next-line*/
  option: SelectOptionT
) => void;

export type OptionClickHandler = (
  option: SelectOptionT,
  isFocused: boolean,
  isDisabled: boolean
) => void;

export type OptionHoverHandler = (
  e: MouseEvent<HTMLDivElement>,
  isFocused: boolean,
  optionIndex: number
) => void;

export type KeyDownHandler = (e: KeyboardEvent<HTMLInputElement>) => void;

export type SelectEventHandlers = {
  handleValueClearClick: ValueClearClickHandler;
  handleOptionClick: OptionClickHandler;
  handleKeyDown: KeyDownHandler;
  handleClearIndicatorClick: ClearIndicatorClickHanlder;
  handleDropdownClick: DropdownClickHandler;
  handleInputChange: InputChangeHandler;
  handleScrollToBottom: () => void;
  handlePageChange: () => void;
};

export type DefaultSelectEventHandlers = Omit<
  SelectEventHandlers,
  | "handleScrollToBottom"
  | "handleValueClearClick"
  | "handlePageChange"
  | "handleInputChange"
> & {
  handleValueClearClick: (
    e: MouseEvent<HTMLDivElement>,
    optionId: string
  ) => void;
  handleValueSelectOnKeyPress: () => void;
  handleInputChange: (inputValue: string, value?: SelectOptionList) => void;
};

// # CUSTOM EVENT HANDLERS

export type CustomValueClearClickHandler = (
  e: MouseEvent<HTMLDivElement>,
  option: SelectOptionT
) => void;

export type CustomOptionClickHandler = (
  option: SelectOptionT,
  isSelected: boolean,
  isDisabled: boolean
) => void;

export type CustomClearIndicatorClickHandler = (
  e: MouseEvent<HTMLDivElement>,
  inputValue: string,
  value: SelectOptionList
) => void;

export type CustomScrollToBottomHandler = (
  options: SelectOptionList | CategorizedSelectOptions,
  page: number
) => void;

export type CustomDropdownClickHandler = (isOpen: boolean) => void;

export type CustomKeyDownHandler = (
  e: KeyboardEvent<HTMLInputElement>,
  {
    focusedOptionIndex,
    focusedOptionCategory,
    setFocusedOptionCategory,
    setFocusedOptionIndex,
  }: {
    focusedOptionIndex: number | null;
    focusedOptionCategory: keyof SelectOptionT;
    setFocusedOptionIndex: StateSetter<number>;
    setFocusedOptionCategory: StateSetter<string>;
  },
  selectOptions: SelectOptionList | CategorizedSelectOptions
) => void;

export type CustomSelectEventHandlers = {
  onInputChange?: CustomInputChangeHandler;
  onValueClear?: CustomValueClearClickHandler;
  onOptionClick?: CustomOptionClickHandler;
  onClearIndicatorClick?: CustomClearIndicatorClickHandler;
  onDropdownClick?: CustomDropdownClickHandler;
  onScrollToBottom?: CustomScrollToBottomHandler;
  onKeyDown?: CustomKeyDownHandler;
};

export type EventHandlerFollowupFunctions = {
  onAfterInputChange?: CustomInputChangeHandler;
  onAfterValueClear?: CustomValueClearClickHandler;
  onAfterOptionClick?: CustomOptionClickHandler;
  onAfterClearIndicatorClick?: CustomClearIndicatorClickHandler;
  onAfterDropdownClick?: CustomDropdownClickHandler;
  onAfterScrollToBottom?: CustomScrollToBottomHandler;
};

// # OTHER FUNCTION TYPES

export type CustomPreventInputUpdate = (
  e: ChangeEvent<HTMLInputElement>,
  updatedInputValue: string,
  currInputValue: string
) => boolean;

export type PreventInputUpdate = (
  e: ChangeEvent<HTMLInputElement>,
  updatedInputValue: string
) => boolean;

export type SelectFetchFunction = (
  params: {
    page?: number;
    searchQuery?: string;
    recordsPerPage?: number;
  },
  signal?: AbortSignal
) => Promise<{ data: SelectOptionList; totalRecords: number }> | Promise<void>;

export type SelectSorterFunction = (
  options: SelectOptionList
) => SelectOptionList;

export type SelectOptionFilter = (option: SelectOptionT) => boolean;

export type SelectCategorizeFuntion = (
  options: SelectOptionList
) => CategorizedSelectOptions;

// #OTHER PROPERTIES

export type SelectFocusNavigationFallbackDirection =
  | SelectKeyboardNavigationDirection
  | "opposite";

export type SelectKeyboardNavigationDirection = "next" | "previous";

export type SelectDomRefs = {
  selectListContainerRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  selectOptionsRef: React.MutableRefObject<Map<string, HTMLDivElement> | null>;
  selectTopRef: React.RefObject<HTMLDivElement>;
};

export type SelectAsyncStateUpdaters = {
  handlePageResetAsync: () => void;
  loadNextPageAsync: () => void;
};

export type SelectCategoryFocusDetails = {
  focusedCategory: keyof SelectOptionT;
  focusedOptionIdx: number;
};

export type CustomClassName = { className: string; override?: boolean };

export type SelectCustomClassNames = {
  selectContainer: CustomClassName;
  selectTopContainer: CustomClassName;
  selectDisabled: CustomClassName;
  selectSingleValue: CustomClassName;
  selectMultiValue: CustomClassName;
  selectMultiValueIconContainer: CustomClassName;
  selectMultiValueIcon: CustomClassName;
  selectInputContainer: CustomClassName;
  selectInputValue: CustomClassName;
  selectClearIndicator: CustomClassName;
  selectClearIndicatorDisabled: CustomClassName;
  selectDropdownIndicator: CustomClassName;
  selectDropdownIndicatorDisabled: CustomClassName;
  selectOptionList: CustomClassName;
  selectOptionListWrapper: CustomClassName;
  selectOptionListEmpty: CustomClassName;
  selectCategoryHeader: CustomClassName;
  selectCategoryList: CustomClassName;
  selectOption: CustomClassName;
  selectOptionFocused: CustomClassName;
  selectOptionDisabled: CustomClassName;
  selectOptionSelected: CustomClassName;
};

export type SelectCustomRefs = {
  inputRef: RefObject<HTMLInputElement>;
  optionListRef: RefObject<HTMLDivElement>;
};
