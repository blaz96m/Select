import { SelectClearIndicatorProps } from "../components/SelectClearIndicator";
import { SelectDropdownIndicatorProps } from "../components/SelectDropdownIndicator";
import { SelectOptionProps } from "../components/SelectOption";
import { SelectValueProps } from "../components/SelectValue";
import { SelectMultiValueProps } from "src/Select/components/SelectMultiValueElement";
import { SelectInputProps } from "src/Select/components/SelectInput";
import { SelectCategoryProps } from "src/Select/components/SelectCategory";
import { Dispatch, SetStateAction } from "react";

export type SelectOptionT = {
  id: string;
  [key: string]: any;
};

export type SelectOptionList = SelectOptionT[];

export type CategorizedSelectOptions = { [key: string]: SelectOptionList };

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

export type SelectOptionFromCategoryRenderer = (
  option: SelectOptionT,
  index: number,
  focusedOptionIdx: number | null,
  selectedOptions: SelectOptionList | null
) => void;

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

export type OptionHoverHandler = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  isFocused: boolean,
  optionIndex: number
) => void;

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
