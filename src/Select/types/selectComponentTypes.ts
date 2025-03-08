import { ChangeEvent, RefObject } from "react";
import {
  SelectOptionList,
  CustomOptionClickHandler,
  CustomClearIndicatorClickHandler,
  DropdownClickHandler,
  InputChangeHandler,
  CustomValueClearClickHandler,
  CustomScrollToBottomHandler,
  SelectOptionT,
  CustomPreventInputUpdate,
  SelectFetchFunction,
  SelectSorterFunction,
  CustomSelectCategorizeFunction,
  SelectCategoryT,
  CategorizedSelectOptions,
  SelectFocusNavigationFallbackDirection,
  PreventInputUpdate,
  OptionClickHandler,
  ValueClearClickHandler,
  ClearIndicatorClickHanlder,
  CustomDropdownClickHandler,
  SelectOptionFilter,
  KeyDownHandler,
  SelectKeyboardNavigationDirection,
  SelectCustomClassNames,
  SelectCustomRefs,
} from "src/Select/types/selectGeneralTypes";

import { StateSetter } from "src/Select/types/selectStateTypes";

// #CUSTOM COMPONENTS

export enum SelectComponents {
  SELECT_OPTION = "SELECT_OPTION",
  DROPDOWN_INDICATOR = "DROPDOWN_INDICATOR",
  CLEAR_INDICATOR = "CLEAR_INDICATOR",
  SINGLE_VALUE = "SINGLE_VALUE",
  MULTI_VALUE = "MULTI_VALUE",
  INPUT = "INPUT",
}

type CustomSelectComponent<
  ComponentPropsT extends SelectCustomComponentProps,
  InnerPropsT extends SelectComponentInnerProps = null
> = InnerPropsT extends null
  ? (componentProps: CustomComponentProps<ComponentPropsT>) => JSX.Element
  : (
      componentProps: CustomComponentProps<ComponentPropsT>,
      innerProps: InnerPropsT
    ) => JSX.Element;

type CustomComponentProps<T> = T;

export type SelectComponentInnerProps =
  | null
  | SelectOptionInnerProps
  | SelectMultiValueInnerProps
  | SelectDropdownIndicatorInnerProps
  | SelectClearIndicatorInnerProps
  | SelectInputInnerProps
  | SelectOptionListInnerProps
  | SelectCategoryInnerProps;

export type SelectCustomComponentProps =
  | CustomSelectOptionComponentProps
  | CustomSelectOptionListProps
  | CustomSelectCategoryProps
  | CustomSelectMultiValueProps
  | CustomSelectDropdownIndicatorProps
  | CustomSelectClearIndicatorProps
  | CustomSelectInputComponentProps;

export type SelectCustomComponents = {
  SelectOptionElement: CustomSelectOptionComponent;
  SelectMultiValueElement: CustomSelectMultiValueComponent;
  SelectDropdownIndicatorElement: CustomSelectDropdownIndicatorComponent;
  SelectClearIndicatorElement: CustomSelectClearIndicatorComponent;
  SelectOptionListElement: CustomOptionListComponent;
  SelectCategoryElement: CustomSelectCategoryComponent;
  SelectInputElement: CustomSelectInputComponent;
};

// #SELECT COMPONENT

export type SelectProps = {
  value: SelectOptionList | [];
  labelKey: keyof SelectOptionT;
  onChange: StateSetter<SelectOptionList>;
  isMultiValue: boolean;
  useAsync: boolean;
  fetchOnInputChange: boolean;
  removeSelectedOptionsFromList: boolean;
  disableInputUpdate: boolean;
  isCategorized: boolean;
  fetchOnScroll: boolean;
  disableInputEffect: boolean;
  customComponents: Partial<SelectCustomComponents>;
  clearInputOnIdicatorClick: boolean;
  lazyInit: boolean;
  hasInput: boolean;
  updateSelectOptionsAfterFetch: boolean;
  optionFilter?: SelectOptionFilter;
  placeholder: string;
  preventInputUpdate: CustomPreventInputUpdate;
  onOptionClick?: CustomOptionClickHandler;
  onAfterOptionClick?: CustomOptionClickHandler;
  onClearIndicatorClick?: CustomClearIndicatorClickHandler;
  onAfterClearIndicatorClick?: CustomClearIndicatorClickHandler;
  onDropdownClick?: CustomDropdownClickHandler;
  onAfterDropdownClick?: DropdownClickHandler;
  onInputChange?: InputChangeHandler;
  onAfterInputUpdate?: InputChangeHandler;
  onValueClear?: CustomValueClearClickHandler;
  onAfterValueClear?: CustomValueClearClickHandler;
  onScrollToBottom?: CustomScrollToBottomHandler;
  onAfterScrollToBottom?: CustomScrollToBottomHandler;
  onKeyDown?: KeyDownHandler;
  closeDropdownOnSelect?: boolean;
  debounceInputUpdate?: boolean;
  inputUpdateDebounceDuration: number;
  inputValue?: string;
  categoryKey?: keyof SelectOptionT & string;
  clearInputOnSelect?: boolean;
  setInputValue?: StateSetter<string>;
  selectOptions?: SelectOptionList;
  setSelectOptions?: StateSetter<SelectOptionList>;
  defaultSelectOptions?: SelectOptionList;
  isOptionDisabled?: (option: SelectOptionT) => boolean;
  inputFilterFunction?: (
    selectOptions: SelectOptionList,
    inputValue: string
  ) => SelectOptionList;
  isOpen?: boolean;
  page?: number;
  setIsOpen?: StateSetter<boolean>;
  setPage?: StateSetter<number>;
  fetchFunction?: SelectFetchFunction;
  sortFunction?: SelectSorterFunction;
  onPageChange?: (page: number) => void;
  showClearIndicator?: boolean;
  isLoading?: boolean;
  classNames: Partial<SelectCustomClassNames>;
  refs: Partial<SelectCustomRefs>;
  categorizeFunction?: CustomSelectCategorizeFunction;
  recordsPerPage?: number;
};

// #OPTION COMPONENT

export type SelectOptionProps = {
  labelKey: keyof SelectOptionT;
  option: SelectOptionT;
  optionIndex: number;
  handleHover: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    isFocused: boolean,
    optionIndex: number
  ) => void;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  isCategorized: boolean;
  customComponentRenderer: CustomSelectOptionRenderer;
  isFocused: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: OptionClickHandler;
  categoryKey?: keyof SelectOptionT;
};

export type SelectOptionRenderer = (
  option: SelectOptionT,
  index: number
) => JSX.Element;

export type SelectOptionFromCategoryRenderer = (
  option: SelectOptionT,
  index: number,
  focusedOptionIdx: number | null,
  selectedOptions: SelectOptionList | null
) => JSX.Element;

export type CustomSelectOptionComponentProps = Omit<
  SelectOptionProps,
  | "className"
  | "onClick"
  | "refCallback"
  | "handleHover"
  | "customComponentRenderer"
> & {
  onOptionSelect: (isSelected: boolean, option: SelectOptionT) => void;
  value: SelectOptionList;
  setValue: StateSetter<SelectOptionList>;
  clearInput: () => void;
  focusInput: () => void;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  labelKey: keyof SelectOptionT;
  clearInputOnSelect: boolean;
  isMultiValue: boolean;
  isDisabled: boolean;
  closeDropdown: () => void;
  resetFocus: () => void;
  isFocused: boolean;
  optionIndex: number;
  isSelected: boolean;
  option: SelectOptionT;
};

export type SelectOptionInnerProps = {
  onClick: (...args: any) => void;
  onMouseMove: (...args: any) => void;
  "data-category": boolean;
  "data-selected": boolean;
  key: string;
  ref: React.LegacyRef<HTMLDivElement>;
  id: string;
  className: string;
};

type CustomSelectOptionRenderer = (
  selectOptionProps: Omit<SelectOptionProps, "customComponentRenderer"> & {
    className: string;
    refCallback: (node: HTMLDivElement) => void;
  },
  customComponent: CustomSelectOptionComponent
) => JSX.Element;

export type CustomSelectOptionComponent = CustomSelectComponent<
  CustomSelectOptionComponentProps,
  SelectOptionInnerProps
>;

// #OPTION LIST COMPONTENT
export type SelectOptionListProps = {
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  renderFunction: SelectCategoryComponent | SelectOptionRenderer;
  customComponentRenderer: CustomSelectOptionListRenderer;
  isCategorized?: boolean;
  isLoading?: boolean;
  handleScrollToBottom: () => void;
};

export type CustomSelectOptionListProps = {
  handlePageChange: () => void;
  page: number;
  isLastPage: () => boolean | void;
  fetchOnScrollToBottom: boolean | undefined;
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  isCategorized?: boolean;
  isLoading?: boolean;
  handleScrollToBottom: () => void;
};

export type SelectOptionListInnerProps = {
  wrapperClassName: string;
  ref: RefObject<HTMLDivElement>;
  listClassName: string;
};

export type CustomOptionListComponent = CustomSelectComponent<
  CustomSelectOptionListProps,
  SelectOptionListInnerProps
>;

export type CustomSelectOptionListRenderer = (
  selectOptionListProps: Omit<
    SelectOptionListProps,
    "customComponentRenderer"
  > & {
    listClassName: string;
    wrapperClassName: string;
    ref: RefObject<HTMLDivElement>;
  },
  customComponent: CustomOptionListComponent
) => JSX.Element;

// #CATEGORY COMPONENT

export type SelectCategoryProps = {
  categoryOptions: SelectOptionList;
  categoryName: keyof SelectOptionT;
  selectedOptions: SelectOptionList | null;
  focusedOptionIdx: number | null;
  customComponentRenderer: CustomSelectCategoryRenderer;
  renderOption: SelectOptionFromCategoryRenderer;
};

export type CustomSelectCategoryRenderer = (
  selectOptionCategoryProps: Omit<
    SelectCategoryProps,
    "customComponentRenderer"
  > & {
    categoryHeaderClassName: string;
    categoryListClassName: string;
  },
  customComponent: CustomSelectCategoryComponent
) => JSX.Element;

export type SelectCategoryComponent = (
  category: SelectCategoryT
) => JSX.Element;

export type SelectCategoryInnerProps = {
  categoryHeaderClassName: string;
  categoryListClassName: string;
};

export type CustomSelectCategoryComponent = CustomSelectComponent<
  CustomSelectCategoryProps,
  SelectCategoryInnerProps
>;

export type CustomSelectCategoryProps = Omit<
  SelectCategoryProps,
  "customComponentRenderer"
> & {
  value: SelectOptionList;
};

// #INPUT COMPONENT

export type SelectInputProps = {
  onInputChange: (inputValue: string) => void;
  inputValue: string;
  handleKeyPress: KeyDownHandler;
  handleOptionsSearchTrigger: (inputValue: string) => void;
  customComponentRenderer: CustomSelectInputRenderer;
  preventInputUpdate: PreventInputUpdate;
  isLoading?: boolean;
};

export type CustomSelectInputComponent = CustomSelectComponent<
  CustomSelectInputComponentProps,
  SelectInputInnerProps
>;

type CustomSelectInputRenderer = (
  selectInputProps: Omit<
    SelectInputProps,
    "customComponentRenderer" | "hasInput"
  > & {
    className: string;
    containerClassName: string;
    ref: RefObject<HTMLInputElement>;
  },
  customComponent: CustomSelectInputComponent
) => JSX.Element;

export type CustomSelectInputComponentProps = {
  filterSearchedOptions: (inputValue: string) => void;
  selectOptions: SelectOptionList;
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  value: SelectOptionList;
  handleInputChange: InputChangeHandler;
  handleValueSelectOnKeyPress: () => void;
  focusedOptionIndex: number | null;
  focusedOptionCategory: keyof SelectOptionT;
  focusPreviousOption: () => void;
  focusNextOption: (
    fallbackDirection?: SelectFocusNavigationFallbackDirection
  ) => void;
  openDropdown: () => void;
  closeDropdown: () => void;
  clearAllValues: () => void;
};

export type SelectInputInnerProps = {
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string;
  ref: React.RefObject<HTMLInputElement>;
  className: string;
  containerClassName: string;
  disabled?: boolean;
};

// #VALUE COMPONENT

export type SelectMultiValueProps = {
  value: SelectOptionT;
  labelKey: keyof SelectOptionT;
  valueList: SelectOptionList;
  customComponentRenderer: CustomSelectMultiValueRenderer;
  handleValueClear: ValueClearClickHandler;
};

export type CustomSelectMultiValueProps = Omit<
  SelectMultiValueProps,
  "customComponentRenderer"
> & {
  clearInput: () => void;
  focusInput: () => void;
  clearValue: (optionId: string) => void;
  label: string;
};

export type SelectMultiValueInnerProps = {
  className: string;
  iconContainerClassName: string;
  iconClassName: string;
  onClick: ValueClearClickHandler;
};

export type CustomSelectMultiValueRenderer = (
  selectMultiValueProps: Omit<
    SelectMultiValueProps,
    "customComponentRenderer"
  > & {
    className: string;
    iconContainerClassName: string;
    iconClassName: string;
  },
  customComponent: CustomSelectMultiValueComponent
) => JSX.Element;

export type CustomSelectMultiValueComponent = CustomSelectComponent<
  CustomSelectMultiValueProps,
  SelectMultiValueInnerProps
>;

export type SelectSingleValueProps = Pick<SelectValueProps, "labelKey"> & {
  value: SelectOptionT;
};

export type SelectValueProps = {
  customComponentRenderer: CustomSelectMultiValueRenderer;
  labelKey: keyof SelectOptionT;
  value: SelectOptionList;
  onClear: ValueClearClickHandler;
};

// #DROPDOWN INDICATOR COMPONENT

export type SelectDropdownIndicatorProps = {
  isOpen: boolean;
  customComponentRenderer: CustomSelectDropdownIndicatorRenderer;
  isLoading?: boolean;
};

export type CustomSelectDropdownIndicatorProps = Omit<
  SelectDropdownIndicatorProps,
  "customComponentRenderer"
>;

export type CustomSelectDropdownIndicatorComponent = CustomSelectComponent<
  CustomSelectDropdownIndicatorProps,
  SelectDropdownIndicatorInnerProps
>;

export type CustomSelectDropdownIndicatorRenderer = (
  selectDropdownIndicatorProps: Omit<
    CustomSelectDropdownIndicatorProps,
    "customComponentRenderer"
  > & { className: string },
  customComponent: CustomSelectDropdownIndicatorComponent
) => JSX.Element;

export type SelectDropdownIndicatorInnerProps = {
  className: string;
};

// #CLEAR INDICATOR COMPONENT

export type SelectClearIndicatorProps = {
  handleClearIndicatorClick: ClearIndicatorClickHanlder;
  customComponentRenderer: CustomSelectClearIndicatorRenderer;
  isLoading: boolean | undefined;
};

export type CustomSelectClearIndicatorProps = {
  isLoading: boolean | undefined;
  value: SelectOptionList;
  inputValue: string;
  clearInputOnIdicatorClick: boolean;
};

export type SelectClearIndicatorInnerProps = {
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  className: string;
};

export type CustomSelectClearIndicatorComponent = CustomSelectComponent<
  CustomSelectClearIndicatorProps,
  SelectClearIndicatorInnerProps
>;

type CustomSelectClearIndicatorRenderer = (
  selectClearIndicatorProps: Omit<
    SelectClearIndicatorProps,
    "customComponentRenderer"
  > & { className: string },
  customComponent: CustomSelectClearIndicatorComponent
) => JSX.Element;
