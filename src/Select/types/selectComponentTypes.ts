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

type CustomSelectComponentRenderer<
  ComponentPropsT extends SelectCustomComponentProps,
  InnerPropsT extends SelectComponentInnerProps = null
> = InnerPropsT extends null
  ? (componentProps: CustomComponentProps<ComponentPropsT>) => JSX.Element
  : (
      componentProps: CustomComponentProps<ComponentPropsT>,
      innerProps: InnerPropsT
    ) => JSX.Element;

type CustomComponentProps<T> = T;

export type SelectOptionInnerProps = {
  onClick: (...args: any) => void;
  onMouseMove: (...args: any) => void;
  "data-category": string;
  ref: React.LegacyRef<HTMLDivElement>;
  id: string;
  className: string;
};

export type SelectInputInnerProps = {
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  ref: React.RefObject<HTMLInputElement>;
  className: string;
  disabled?: boolean;
};

export type SelectInputComponentHandlers = {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputValue: string;
  innerRef: React.RefObject<HTMLInputElement>;
  className: string;
  isLoading?: boolean;
};

export type SelectDropdownIndicatorInnerProps = {
  className: string;
};

export type SelectClearIndicatorInnerProps = {
  onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

export type BasicComponentInnerProps = {
  className?: string;
};

export type SelectComponentInnerProps =
  | null
  | BasicComponentInnerProps
  | SelectOptionInnerProps
  | SelectMultiValueInnerProps
  | SelectDropdownIndicatorInnerProps
  | SelectClearIndicatorInnerProps
  | SelectInputInnerProps;

export type SelectCustomComponentProps =
  | SelectOptionProps
  | SelectSingleValueProps
  | SelectMultiValueProps
  | SelectDropdownIndicatorProps
  | SelectClearIndicatorProps
  | SelectInputProps
  | SelectCategoryCustomComponentProps;

export type SelectComponentHandlers =
  | SelectOptionComponentHandlers
  | SelectInputComponentHandlers;

export type SelectOptionComponentHandlers = {
  option: SelectOptionT;
  isCategorized: boolean;
  categoryKey?: keyof SelectOptionT;
  handleOptionClick: (option: SelectOptionT, isSelected: boolean) => void;
  handleMouseHover: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  className: string;
  refCallback: (node: HTMLDivElement | null) => void;
};

export type SelectValueCustomComponentProps = {
  valueLabel: string;
} & SelectValueProps;

export type SelectCategoryCustomComponentProps = Omit<
  SelectCategoryProps,
  "renderOption"
>;

export type SelectSingleValueProps = Pick<SelectValueProps, "labelKey"> & {
  value: SelectOptionT;
};

export type SelectMultiValueCustomComponentProps = {
  valueLabel: string;
  value: SelectOptionT;
} & Omit<SelectValueProps, "value">;

export type SelectMultiValueInnerProps = {
  onClick: ValueClearClickHandler;
  className: string;
};

export type CustomSelectOptionRenderer = CustomSelectComponentRenderer<
  SelectOptionProps,
  SelectOptionInnerProps
>;

export type CustomSelectSingleValueRenderer =
  CustomSelectComponentRenderer<SelectSingleValueProps>;

export type CustomSelectMultiValueRenderer = CustomSelectComponentRenderer<
  SelectMultiValueProps,
  SelectMultiValueInnerProps
>;

export type CustomSelectDropdownIndicatorRenderer =
  CustomSelectComponentRenderer<
    SelectDropdownIndicatorProps,
    SelectDropdownIndicatorInnerProps
  >;

export type CustomSelectClearIndicatorRenderer = CustomSelectComponentRenderer<
  SelectClearIndicatorProps,
  SelectClearIndicatorInnerProps
>;

export type CustomSelectInputRenderer = CustomSelectComponentRenderer<
  SelectInputProps,
  SelectInputInnerProps
>;

export type CustomSelectCategoryRenderer = CustomSelectComponentRenderer<
  SelectCategoryCustomComponentProps,
  { className: string }
>;

export type SelectCustomComponents = {
  SelectOptionElement?: CustomSelectOptionRenderer;
  SelectMultiValueElement?: CustomSelectMultiValueRenderer;
  SelectSingleValueElement?: CustomSelectSingleValueRenderer;
  SelectDropdownIndicatorElement?: CustomSelectDropdownIndicatorRenderer;
  SelectClearIndicatorElement?: CustomSelectClearIndicatorRenderer;
  SelectCategoryElement?: CustomSelectCategoryRenderer;
  SelectInputElement?: {
    customComponent: CustomSelectInputRenderer;
    renderContainer?: boolean;
  };
};

// #SELECT COMPONENT

export type SelectProps = {
  value: SelectOptionList | [];
  labelKey: keyof SelectOptionT;
  onChange: StateSetter<SelectOptionList>;
  isMultiValue: boolean;
  usesAsync: boolean;
  fetchOnInputChange: boolean;
  removeSelectedOptionsFromList: boolean;
  disableInputFetchTrigger: boolean;
  disableInputUpdate: boolean;
  isCategorized: boolean;
  fetchOnScroll: boolean;
  clearInputOnIdicatorClick: boolean;
  lazyInit: boolean;
  hasInput: boolean;
  onOptionClick?: CustomOptionClickHandler;
  onAfterOptionClick?: CustomOptionClickHandler;
  onClearIndicatorClick?: CustomClearIndicatorClickHandler;
  onAfterClearIndicatorClick?: CustomClearIndicatorClickHandler;
  onDropdownClick?: CustomDropdownClickHandler;
  onAfterDropdownClick?: DropdownClickHandler;
  onInputUpdate?: InputChangeHandler;
  onAfterInputUpdate?: InputChangeHandler;
  onValueClear?: CustomValueClearClickHandler;
  onAfterValueClear?: CustomValueClearClickHandler;
  onScrollToBottom?: CustomScrollToBottomHandler;
  onAfterScrollToBottom?: CustomScrollToBottomHandler;
  closeDropdownOnSelect?: boolean;
  updateSelectOptionsAfterFetch: boolean;
  inputValue?: string;
  categoryKey?: keyof SelectOptionT & string;
  clearInputOnSelect?: boolean;
  setInputValue?: StateSetter<string>;
  selectOptions?: SelectOptionList;
  setSelectOptions?: StateSetter<SelectOptionList>;
  isOptionDisabled?: (option: SelectOptionT) => boolean;
  inputFilterFunction?: (
    selectOptions: SelectOptionList,
    inputValue: string
  ) => SelectOptionList;
  isOpen?: boolean;
  setIsOpen?: StateSetter<boolean>;
  inputUpdateDebounceDuration?: number;
  placeholder: string;
  preventInputUpdate: CustomPreventInputUpdate;
  fetchFunction?: SelectFetchFunction;
  sortFunction?: SelectSorterFunction;
  onPageChange?: (page: number) => void;
  showClearIndicator?: boolean;
  isLoading?: boolean;
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

// #OPTION LIST COMPONTENT
export type OptionListProps = {
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  renderFunction: SelectCategoryRenderer | SelectOptionRenderer;
  categoryKey: string;
  isCategorized?: boolean;
  isLoading?: boolean;
  handleScrollToBottom: () => void;
};

// #CATEGORY COMPONENT

export type SelectCategoryProps = {
  categoryOptions: SelectOptionList;
  categoryName: keyof SelectOptionT;
  selectedOptions: SelectOptionList | null;
  focusedOptionIdx: number | null;
  renderOption: SelectOptionFromCategoryRenderer;
};

export type SelectCategoryRenderer = (category: SelectCategoryT) => JSX.Element;

// #INPUT COMPONENT

export type SelectInputProps = {
  onInputChange: (inputValue: string) => void;
  inputValue: string;
  focusNextOption: (
    fallbackDirection?: SelectFocusNavigationFallbackDirection
  ) => void;
  focusPreviousOption: () => void;
  addOptionOnKeyPress: () => void;
  hasInput: boolean;
  handleOptionsSearchTrigger: () => void;
  disableInputFetchTrigger: boolean;
  preventInputUpdate: PreventInputUpdate;
  isLoading?: boolean;
};

// #VALUE COMPONENT

export type SelectMultiValueProps = {
  value: SelectOptionT;
  labelKey: keyof SelectOptionT;
  valueList: SelectOptionList;
  handleValueClear: ValueClearClickHandler;
};

export type SelectValueProps = {
  labelKey: keyof SelectOptionT;
  value: SelectOptionList;
  onClear: ValueClearClickHandler;
};

// #INDICATOR COMPONENTS

export type SelectDropdownIndicatorProps = {
  isOpen: boolean;
  isLoading?: boolean;
};

export type SelectClearIndicatorProps = {
  handleClearIndicatorClick: ClearIndicatorClickHanlder;
  isLoading: boolean | undefined;
};
