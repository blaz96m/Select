import { SelectClearIndicatorProps } from "../SelectClearIndicator";
import { SelectDropdownIndicatorProps } from "../SelectDropdownIndicator";
import { SelectOptionProps } from "../SelectOption";
import { SelectValueProps } from "../SelectValue";
import { SelectMultiValueProps } from "src/components/Select/SelectMultiValueElement";
import { SelectInputProps } from "src/components/Select/SelectInput";
import { SelectCategoryProps } from "src/components/SelectCategory";
import { Dispatch, SetStateAction } from "react";

export type SelectOptionT = {
  id: string;
  [key: string]: any;
};

export type SelectOptionList = SelectOptionT[];

export type CategorizedSelectOptions = { [key: string]: SelectOptionT[] };

export type SelectState = {
  value: SelectOptionList | [];
  selectOptions: SelectOptionList | [];
  isOpen: boolean;
  inputValue: string;
  page: number;
  focusedOptionId: string;
  focusedCategory?: keyof SelectOptionT;
};

export type SelectStateSetters = {
  closeDropdown: () => void;
  openDropdown: () => void;
  toggleDropdownVisibility: () => void;
  setInputValue: (value: string) => void;
  clearInput: () => void;
  setOptions: (options: SelectOptionList) => void;
  addOptions: (options: SelectOptionList) => void;
  selectValue: (option: SelectOptionT) => void;
  clearValue: (optionId: string) => void;
  clearAllValues: () => void;
  loadNextPage: () => void;

  setFocusDetails: (
    focusedoptionId: string,
    focusedCategory?: keyof SelectOptionT
  ) => void;
};

export type SelectFocusNavigationFallbackDirection = "opposite" | "previous";

export type SelectFocusState = {
  focusedOptionIndex: number | null;
  focusedOptionCategory: keyof SelectOptionT;
};

export type SelectFocusManager = {
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
    handleOptionHover: HandleOptionHover;
    setFocusOnHover: (optionIdx: number, optionCategory: string) => void;
    isOptionFocused: (option: SelectOptionT, optionIdx: number) => boolean;
    getFocusedOption: () => SelectOptionT | void;
    resetFocus: () => void;
  };
};

export type HandleValueClear = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  option: SelectOptionT
) => void;

export type SelectDomRefs = {
  selectListContainerRef: React.RefObject<HTMLDivElement>;
  selectOptionRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  selectOptionsRef: React.MutableRefObject<Map<string, HTMLDivElement> | null>;
};

export type SelectSorterFunction = (
  options: SelectOptionList | CategorizedSelectOptions
) => SelectOptionList | CategorizedSelectOptions;

export type SelectCategorizeFuntion = (
  options: SelectOptionList
) => CategorizedSelectOptions;

export type CustomSelectCategorizeFunction = (
  options: SelectOptionList
) => CategorizedSelectOptions;

export type SelectKeyboardNavigationDirection = "down" | "up";

export type SelectCategoryFocusDetails = {
  focusedCategory: keyof SelectOptionT;
  focusedOptionIdx: number;
};

export type SelectCategoryT = {
  categoryName: string;
  categoryOptions: SelectOptionList;
};

export type SelectCategoryRenderer = (category: SelectCategoryT) => JSX.Element;

export type SelectOptionRenderer = (
  option: SelectOptionT,
  index: number
) => JSX.Element;

export type selectRendererOverload = {
  (value: SelectOptionT, index: number): React.JSX.Element;
  (
    value: {
      categoryName: string;
      categoryOptions: SelectOptionList;
    },
    key: any
  ): React.JSX.Element;
};

export type SelectFetchFunc = (params: {
  page?: number;
  searchQuery?: string;
}) => Promise<{ data: SelectOptionList; totalRecords: number }> | Promise<void>;

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

export type HandleOptionHover = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  isFocused: boolean,
  optionIndex: number
) => void;

export type SelectSingleValueProps = Pick<SelectValueProps, "labelKey"> & {
  value: SelectOptionT;
};

export type SelectMultiValueCustomComponentProps = {
  valueLabel: string;
  value: SelectOptionT;
} & Omit<SelectValueProps, "value">;

export type SelectMultiValueInnerProps = {
  onClick: HandleValueClear;
  className: string;
};

export type StateSetter<T> = Dispatch<SetStateAction<T>> | ((arg: T) => void);

export type HandleClearIndicatorClick = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent>
) => void;

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

export type SelectEventHandlers = {
  handleValueClearClick: ValueClearClickHandler;
  handleOptionClick: OptionClickHandler;
  handleClearIndicatorClick: ClearIndicatorClickHanlder;
  handleDropdownClick: DropdownClickHandler;
  handleInputChange: InputChangeHandler;
  handleScrollToBottom: () => void;
};

export type CustomValueClearClickHandler = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  option: SelectOptionT
) => void;

export type CustomOptionClickHandler = (
  option: SelectOptionT,
  isSelected: boolean
) => void;

export type CustomClearIndicatorClickHandler = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  inputValue: string,
  value: SelectOptionList
) => void;

export type CustomScrollToBottomHandler = (
  options: SelectOptionList | CategorizedSelectOptions,
  page: number
) => void;

export type CustomDropdownClickHandler = (isOpen: boolean) => void;

export type CustomSelectEventHandlers = {
  onInputUpdate?: InputChangeHandler;
  onValueClear?: CustomValueClearClickHandler;
  onOptionClick?: CustomOptionClickHandler;
  onClearIndicatorClick?: CustomClearIndicatorClickHandler;
  onDropdownClick?: CustomDropdownClickHandler;
  onScrollToBottom?: CustomScrollToBottomHandler;
};

export type EventHandlerFollowupFunctions = {
  onAfterInputUpdate?: InputChangeHandler;
  onAfterValueClear?: CustomValueClearClickHandler;
  onAfterOptionClick?: CustomOptionClickHandler;
  onAfterClearIndicatorClick?: CustomClearIndicatorClickHandler;
  onAfterDropdownClick?: CustomDropdownClickHandler;
  onAfterScrollToBottom?: CustomScrollToBottomHandler;
};

export type InputChangeHandler = (
  inputValue: string,
  value?: SelectOptionList
) => void;

export type DropdownClickHandler = () => void;

export type ClearIndicatorClickHanlder = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent>
) => void;

export type ValueClearClickHandler = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  option: SelectOptionT
) => void;

export type OptionClickHandler = (
  option: SelectOptionT,
  isFocused: boolean,
  focusedOptionIdx: number,
  focusedCategory: string
) => void;

export type SelectAsyncStateUpdaters = {
  handlePageResetAsync: () => void;
  loadNextPageAsync: () => void;
};

export type CustomClass = { className: string; override?: boolean };

export type CustomPreventInputUpdate = (
  newInputValue: string,
  currInputValue: string
) => boolean;

export type PreventInputUpdate = (newInputValue: string) => boolean;

export type CustomClasses = {
  selectTopContainer?: CustomClass;
  selectClearIndicator?: CustomClass;
  selectOptionListContainer?: CustomClass;
  selectOptionList?: CustomClass;
  selectOption?: CustomClass;
  selectInput?: CustomClass;
  selectSingleValue?: CustomClass;
  selectMultiValue?: CustomClass;
  selectCategory?: CustomClass;
};

export type DefaultSelectEventHandlers = Omit<
  SelectEventHandlers,
  | "handleValueClearClick"
  | "handleScrollToBottom"
  | "handleOptionClick"
  | "handleDropdownClick"
> & {
  handleValueClearClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    optionId: string
  ) => void;
  handleOptionClick: (option: SelectOptionT, isSelected: boolean) => void;
};

export enum SelectComponents {
  SELECT_OPTION = "SELECT_OPTION",
  DROPDOWN_INDICATOR = "DROPDOWN_INDICATOR",
  CLEAR_INDICATOR = "CLEAR_INDICATOR",
  SINGLE_VALUE = "SINGLE_VALUE",
  MULTI_VALUE = "MULTI_VALUE",
  INPUT = "INPUT",
}
