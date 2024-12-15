import { SelectClearIndicatorProps } from "../SelectClearIndicator";
import { SelectDropdownIndicatorProps } from "../SelectDropdownIndicator";
import { SelectOptionProps } from "../SelectOption";
import { SelectValueProps } from "../SelectValue";
import { SelectMultiValueProps } from "src/components/Select/SelectMultiValueElement";
import { SelectInputProps } from "src/components/Select/SelectInput";
import { SelectCategoryProps } from "src/components/SelectCategory";

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
  toggleDropdown: () => void;
  setInputValue: (value: string) => void;
  clearInput: () => void;
  setOptions: (options: SelectOptionList) => void;
  addOptions: (options: SelectOptionList) => void;
  addValue: (option: SelectOptionT) => void;
  clearValue: (optionId: string) => void;
  clearAllValues: () => void;
  loadNextPage: () => void;

  setFocusDetails: (
    focusedoptionId: string,
    focusedCategory?: keyof SelectOptionT
  ) => void;
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

export type SelectFetchFunction = (
  link: string,
  params?: { searchQuery?: string; page?: number; [key: string]: any }
) => { data: any[]; totalRecords?: number };

export type SelectKeyboardNavigationDirection = "down" | "up";

export type SelectFocusDetails = {
  focusedOptionId: string;
  focusedCategory?: keyof SelectOptionT;
};

export type selectRendererOverload = {
  (value: SelectOptionT): React.JSX.Element;
  (value: {
    categoryName: string;
    categoryOptions: SelectOptionList;
  }): React.JSX.Element;
};

export type SelectFetchFunc = (params: {
  page?: number;
  searchQuery?: string;
}) => Promise<{ data: SelectOptionList; totalRecords: number }>;

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
};

export type SelectInputComponentHandlers = {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputValue: string;
  innerRef: React.RefObject<HTMLInputElement>;
  className: string;
};

export type SelectDropdownIndicatorInnerProps = {
  onClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    focusInputOnClose?: boolean
  ) => void;
  className: string;
};

export type SelectClearIndicatorInnerProps = {
  onClick: () => void;
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
  handleOptionClick: (option: SelectOptionT) => void;
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

export type SelectSingleValueProps = Pick<
  SelectValueProps,
  "getSelectStateSetters" | "labelKey"
> & { value: SelectOptionT };

export type SelectMultiValueCustomComponentProps = {
  valueLabel: string;
  value: SelectOptionT;
} & Omit<SelectValueProps, "value">;

export type SelectMultiValueInnerProps = {
  onClick: () => void;
  className: string;
};

type CustomSelectComponentRenderer<
  ComponentPropsT extends SelectCustomComponentProps,
  InnerPropsT extends SelectComponentInnerProps = null
> = InnerPropsT extends null
  ? (componentProps: ComponentPropsT) => JSX.Element
  : (componentProps: ComponentPropsT, innerProps: InnerPropsT) => JSX.Element;

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

export enum SelectComponents {
  SELECT_OPTION = "SELECT_OPTION",
  DROPDOWN_INDICATOR = "DROPDOWN_INDICATOR",
  CLEAR_INDICATOR = "CLEAR_INDICATOR",
  SINGLE_VALUE = "SINGLE_VALUE",
  MULTI_VALUE = "MULTI_VALUE",
  INPUT = "INPUT",
}
