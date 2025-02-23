// #OPTION TYPES

export type SelectOptionT = {
  id: string;
  [key: string]: any;
};

export type SelectOptionList = SelectOptionT[];

export type CategorizedSelectOptions = { [key: string]: SelectOptionList };

export type SelectCategoryT = {
  categoryName: string;
  categoryOptions: SelectOptionList;
};

// # EVENT HANDLERS

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

export type OptionHoverHandler = (
  e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  isFocused: boolean,
  optionIndex: number
) => void;

export type SelectEventHandlers = {
  handleValueClearClick: ValueClearClickHandler;
  handleOptionClick: OptionClickHandler;
  handleClearIndicatorClick: ClearIndicatorClickHanlder;
  handleDropdownClick: DropdownClickHandler;
  handleInputChange: InputChangeHandler;
  handleScrollToBottom: () => void;
};

export type DefaultSelectEventHandlers = Omit<
  SelectEventHandlers,
  "handleScrollToBottom" | "handleValueClearClick"
> & {
  handleValueClearClick: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    optionId: string
  ) => void;
  handleValueSelectOnKeyPress: () => void;
};

// # CUSTOM EVENT HANDLERS

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

// # OTHER FUNCTION TYPES

export type CustomPreventInputUpdate = (
  newInputValue: string,
  currInputValue: string
) => boolean;

export type PreventInputUpdate = (newInputValue: string) => boolean;

export type SelectFetchFunction = (
  params: {
    page?: number;
    searchQuery?: string;
  },
  signal?: AbortSignal
) => Promise<{ data: SelectOptionList; totalRecords: number }> | Promise<void>;

export type CustomSelectCategorizeFunction = (
  options: SelectOptionList
) => CategorizedSelectOptions;

export type SelectSorterFunction = (
  options: SelectOptionList | CategorizedSelectOptions
) => SelectOptionList | CategorizedSelectOptions;

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
  selectOptionRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  selectOptionsRef: React.MutableRefObject<Map<string, HTMLDivElement> | null>;
};

export type SelectAsyncStateUpdaters = {
  handlePageResetAsync: () => void;
  loadNextPageAsync: () => void;
};

export type SelectCategoryFocusDetails = {
  focusedCategory: keyof SelectOptionT;
  focusedOptionIdx: number;
};

export type CustomClass = { className: string; override?: boolean };
