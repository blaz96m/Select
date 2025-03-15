import {
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useReducer,
  ChangeEvent,
  KeyboardEvent,
  useLayoutEffect,
  MouseEvent,
} from "react";
import {
  SelectOptionList,
  CategorizedSelectOptions,
  SelectOptionT,
  CustomPreventInputUpdate,
  SelectSorterFunction,
  SelectKeyboardNavigationDirection,
  SelectFocusNavigationFallbackDirection,
  SelectOptionFilter,
} from "src/Select/types/selectGeneralTypes";

import {
  SelectApi,
  CustomState,
  CustomStateSetters,
} from "src/Select/types/selectStateTypes";
import { isEmpty, isFunction, isNil, isNumber, slice, trim } from "lodash-es";
import {
  categorizeOptions,
  filterOptionList,
  filterOptionListBySearchValue,
  getSelectOptionByFocusDetails,
  initializeState,
  isFocusedOptionIndexValid,
} from "src/Select/utils";
import { NO_CATEGORY_KEY } from "src/Select/utils/constants";
import { selectReducer } from "src/Select/stores/selectReducer";
import useSelectFocus from "src/Select/hooks/useSelectFocus";
import useSelectStateResolver from "src/Select/hooks/useSelectStateResolver";

const useSelect = (selectProps: {
  isMultiValue: boolean;
  customState: CustomState;
  customStateSetters: CustomStateSetters;
  labelKey: keyof SelectOptionT;
  fetchOnInputChange?: boolean;
  clearInputOnIdicatorClick?: boolean;
  defaultSelectOptions?: SelectOptionList;
  optionFilter?: SelectOptionFilter;
  closeDropdownOnSelect?: boolean;
  clearInputOnSelect?: boolean;
  preventInputUpdate?: CustomPreventInputUpdate;
  clearValueOnInputChange?: boolean;
  fetchOnScroll?: boolean;
  hasInput?: boolean;
  useAsync?: boolean;
  categoryKey?: keyof SelectOptionT & string;
  removeSelectedOptionsFromList?: boolean;
  sortFunction?: SelectSorterFunction | undefined;
  debounceInputUpdate?: boolean;
  inputUpdateDebounceDuration?: number;
  recordsPerPage?: number;
  isLoading?: boolean | undefined;
  isCategorized?: boolean;

  inputFilterFunction?: (
    selectOptions: SelectOptionList,
    inputValue: string
  ) => SelectOptionList;
}): SelectApi => {
  const {
    isCategorized,
    customState,
    customStateSetters,
    recordsPerPage,
    defaultSelectOptions,
    useAsync,
    optionFilter,
    categoryKey,
    isMultiValue,
    labelKey,
    fetchOnScroll,
    inputUpdateDebounceDuration,
    debounceInputUpdate,
    inputFilterFunction: customInputFilterFunction,
    isLoading,
    fetchOnInputChange,
    clearInputOnIdicatorClick,
    hasInput,
    preventInputUpdate: customPreventInputUpdate,
    clearInputOnSelect: customClearInputOnSelect,
    closeDropdownOnSelect: customCloseDropdownOnSelect,
    sortFunction,
    clearValueOnInputChange,
    removeSelectedOptionsFromList = true,
  } = selectProps;

  // #STATE RESOLVER

  const [defaultSelectState, dispatch] = useReducer(
    selectReducer,
    defaultSelectOptions,
    initializeState
  );
  const resolvedStateData = useSelectStateResolver(
    { ...defaultSelectState, value: customState.value },
    customState,
    customStateSetters,
    isMultiValue,
    dispatch
  );

  const { selectState, selectStateUpdaters } = resolvedStateData;

  const {
    clearValue,
    closeDropdown,
    clearInput,
    selectValue,
    clearAllValues,
    setSelectOptions,
    setInputValue,
    resetPage,
    openDropdown,
    toggleDropdownVisibility,
  } = selectStateUpdaters;

  const { inputValue, page, selectOptions, isOpen, value } = selectState;

  const usesInputAsync = useAsync && fetchOnInputChange;

  // #REFS
  // The originalOptions ref is only used in case all the data for the select comes from the frontend, enabling the partitioning of the options while storing the original value that never changes.
  const originalOptionsRef = useRef<SelectOptionList>(selectOptions);

  const hasPaging =
    (isNumber(recordsPerPage) && recordsPerPage > 0) ||
    (useAsync && fetchOnScroll);

  const selectListContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectOptionsRef = useRef<Map<string, HTMLDivElement> | null>(null);
  const selectTopRef = useRef<HTMLDivElement>(null);
  const previousInputValueRef = useRef("");

  const getSelectOptionsMap = useCallback(() => {
    if (!selectOptionsRef.current) {
      selectOptionsRef.current = new Map();
    }
    return selectOptionsRef.current;
  }, []);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // #COMPUTED VALUES

  const partitionedOptions = useMemo((): SelectOptionList | null => {
    const options = selectState.selectOptions;
    if (
      !fetchOnScroll &&
      !(usesInputAsync && fetchOnInputChange) &&
      recordsPerPage &&
      !isEmpty(selectState.selectOptions)
    ) {
      return slice(options, 0, selectState.page * recordsPerPage);
    }

    return options;
  }, [selectState.selectOptions, selectState.page]);

  const filteredOptions = useMemo((): SelectOptionList => {
    const options = partitionedOptions || selectOptions;
    return filterOptionList(
      options,
      value,
      removeSelectedOptionsFromList,
      optionFilter
    );
  }, [partitionedOptions, value, removeSelectedOptionsFromList, optionFilter]);

  const sortedOptions = useMemo((): SelectOptionList => {
    return isFunction(sortFunction)
      ? sortFunction(filteredOptions)
      : filteredOptions;
  }, [filteredOptions, sortFunction]);

  const categorizedOptions = useMemo((): CategorizedSelectOptions | null => {
    if (isCategorized && !categoryKey) throw new Error(NO_CATEGORY_KEY);
    const options = sortedOptions;
    if (isCategorized) {
      return categorizeOptions(options, categoryKey as keyof SelectOptionT);
    }
    return null;
  }, [isCategorized, sortedOptions]);

  const displayedOptions = categorizedOptions || sortedOptions;

  // SELECT FOCUS HANDLER
  const { selectFocusHandlers, selectFocusState } = useSelectFocus({
    displayedOptions,
    isCategorized,
    categoryKey,
    getSelectOptionsMap,
    selectListContainerRef,
  });

  const { focusedOptionCategory, focusedOptionIndex } = selectFocusState;

  const getFocusDirectionsOnSelect = useCallback(
    (isOptionSelected: boolean) => {
      const removeOptionFromSelectedValues =
        isOptionSelected && !removeSelectedOptionsFromList;
      const focusDirection: SelectKeyboardNavigationDirection =
        removeOptionFromSelectedValues ? "previous" : "next";
      const focusFallbackDirection: SelectFocusNavigationFallbackDirection =
        removeOptionFromSelectedValues ? "next" : "previous";

      return { focusDirection, focusFallbackDirection };
    },
    [removeSelectedOptionsFromList]
  );

  const {
    resetFocus,
    handleOptionFocusOnSelectByKeyPress,
    focusNextOption,
    focusPreviousOption,
  } = selectFocusHandlers;

  // #PROP RESOLVERS

  const defaultPreventInputUpdate = useCallback(
    (updatedValue: string) => (!trim(updatedValue) && !inputValue) || !hasInput,
    [hasInput, inputValue]
  );
  const preventInputUpdate = useCallback(
    (e: ChangeEvent<HTMLInputElement>, updatedValue: string) => {
      if (isFunction(customPreventInputUpdate))
        return customPreventInputUpdate(e, updatedValue, inputValue);
      const res = defaultPreventInputUpdate(updatedValue);
      return res;
    },
    [defaultPreventInputUpdate, customPreventInputUpdate]
  );

  const defaultClearInputOnSelect = isMultiValue ? false : true;

  const clearInputOnSelect = isNil(customClearInputOnSelect)
    ? defaultClearInputOnSelect
    : customClearInputOnSelect;

  const closeDropdownOnSelectDefault = isMultiValue ? false : true;
  const closeDropdownOnSelect = isNil(customCloseDropdownOnSelect)
    ? closeDropdownOnSelectDefault
    : customCloseDropdownOnSelect;

  // #EVENT HANDLERS

  const onOptionSelect = useCallback(
    (isSelected: boolean, option: SelectOptionT) => {
      return isSelected && !removeSelectedOptionsFromList
        ? clearValue(option.id)
        : selectValue(option);
    },
    [removeSelectedOptionsFromList, clearValue, selectValue, value]
  );

  const isLastPage = useCallback(() => {
    const totalRecordsNumber = selectOptions.length;
    if (totalRecordsNumber && recordsPerPage) {
      return page * recordsPerPage >= totalRecordsNumber;
    }
    return true;
  }, [page, recordsPerPage, selectOptions]);

  const loadNextPage = useCallback(() => {
    if (!isLastPage()) {
      selectStateUpdaters.loadNextPage();
    }
  }, [isLastPage]);

  const handlePageReset = useCallback(() => {
    if (hasPaging) {
      resetPage();
    }
  }, [hasPaging, resetPage]);

  const onAfterOptionFilter = useCallback(
    (inputValue: string) => {
      handlePageReset();
      previousInputValueRef.current = inputValue;
      if (
        selectListContainerRef.current &&
        selectListContainerRef.current.scrollTop
      ) {
        selectListContainerRef.current.scroll({ top: 0 });
      }
    },
    [handlePageReset]
  );

  const clearSelectOptionFilter = useCallback(() => {
    const originalOptions = getOriginalOptions();
    setSelectOptions(originalOptions);
    onAfterOptionFilter("");
  }, [onAfterOptionFilter]);

  const onAfterOptionSelect = useCallback(() => {
    clearInputOnSelect && clearInput();
    if (!closeDropdownOnSelect) {
      focusInput();
    } else {
      closeDropdown();
      resetFocus();
    }
    if (
      !(useAsync && usesInputAsync) &&
      !debounceInputUpdate &&
      clearInputOnSelect &&
      inputRef?.current?.value
    ) {
      clearSelectOptionFilter();
    }
  }, [
    closeDropdownOnSelect,
    resetFocus,
    useAsync,
    usesInputAsync,
    clearInputOnSelect,
    clearSelectOptionFilter,
  ]);

  const handleInputChange = useCallback(
    (inputValue: string) => {
      setInputValue(inputValue);
      !isOpen && openDropdown();
      if (!isMultiValue && clearValueOnInputChange && !isEmpty(value)) {
        clearAllValues();
      }
      !debounceInputUpdate && handleOptionsInputFilter(inputValue);
    },
    [isMultiValue, clearValueOnInputChange, isOpen, value, debounceInputUpdate]
  );

  const handleValueSelectOnKeyPress = useCallback(() => {
    if (isEmpty(displayedOptions)) {
      return;
    }
    const optionsMap = getSelectOptionsMap();
    const targetOption = getSelectOptionByFocusDetails(
      displayedOptions,
      focusedOptionIndex!,
      focusedOptionCategory
    );
    const optionRef = optionsMap.get(String(targetOption.id));
    const isOptionDisabled = optionRef?.dataset.disabled === "true";
    if (
      !isFocusedOptionIndexValid(focusedOptionIndex) ||
      isOptionDisabled ||
      (isCategorized && !focusedOptionCategory) ||
      isEmpty(displayedOptions)
    )
      return;

    const selectOptionsMap = getSelectOptionsMap();
    const targetOptionNode = selectOptionsMap.get(String(targetOption.id));
    if (targetOptionNode) {
      const isOptionSelected = targetOptionNode.dataset.selected! === "true";
      onOptionSelect(isOptionSelected, targetOption);

      const { focusDirection, focusFallbackDirection } =
        getFocusDirectionsOnSelect(isOptionSelected);

      handleOptionFocusOnSelectByKeyPress(
        focusDirection,
        focusFallbackDirection
      );

      onAfterOptionSelect();
    }
  }, [
    handleOptionFocusOnSelectByKeyPress,
    onOptionSelect,
    onAfterOptionSelect,
  ]);

  const getOriginalOptions = () => originalOptionsRef.current;

  const setOriginalOptions = (options: SelectOptionList) =>
    (originalOptionsRef.current = options);

  const handleClearIndicatorClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (isLoading) return;
      e.stopPropagation();
      !isEmpty(value) && clearAllValues();
      inputValue && clearInputOnIdicatorClick && clearInput();
      if (
        !(useAsync && usesInputAsync) &&
        !debounceInputUpdate &&
        clearInputOnIdicatorClick &&
        inputRef?.current?.value
      ) {
        clearSelectOptionFilter();
      }
      focusInput();
    },
    [
      inputValue,
      value,
      isLoading,
      clearInputOnIdicatorClick,
      debounceInputUpdate,
    ]
  );

  const handleDropdownClick = useCallback(() => {
    if (isLoading) return;
    const willOpen = !isOpen;
    toggleDropdownVisibility();
    willOpen ? focusInput() : resetFocus();
  }, [isLoading, isOpen, toggleDropdownVisibility, resetFocus]);

  const handleOptionClick = useCallback(
    (option: SelectOptionT, isSelected: boolean, isDisabled: boolean) => {
      if (isLoading || isDisabled) return;
      onOptionSelect(isSelected, option);
      onAfterOptionSelect();
    },
    [
      closeDropdown,
      focusInput,
      resetFocus,
      isLoading,
      onOptionSelect,
      onAfterOptionSelect,
    ]
  );

  const handleValueClearClick = (
    e: MouseEvent<HTMLDivElement>,
    optionId: string
  ) => {
    e.stopPropagation();
    clearValue(optionId);
    focusInput();
  };

  const filterSearchedOptions = useCallback(
    (inputValue: string) => {
      const originalOptions = getOriginalOptions();
      const filteredOptions = isFunction(customInputFilterFunction)
        ? customInputFilterFunction(originalOptions, inputValue)
        : filterOptionListBySearchValue(originalOptions, labelKey, inputValue);
      setSelectOptions(filteredOptions);
      onAfterOptionFilter(inputValue);
    },
    [selectOptions, customInputFilterFunction, onAfterOptionFilter]
  );

  const handleOptionsInputFilter = useCallback(
    (inputValue: string) => {
      const inputUpdated = inputValue !== previousInputValueRef.current;
      if (usesInputAsync || (debounceInputUpdate && !inputUpdated)) return;
      if (!inputValue || !debounceInputUpdate) {
        return filterSearchedOptions(inputValue);
      }
      const timeoutId = setTimeout(() => {
        filterSearchedOptions(inputValue);
      }, inputUpdateDebounceDuration);
      return timeoutId;
    },
    [
      usesInputAsync,
      filterSearchedOptions,
      inputUpdateDebounceDuration,
      debounceInputUpdate,
    ]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.code) {
        case "ArrowUp":
          e.preventDefault();
          focusPreviousOption();
          break;
        case "ArrowDown":
          focusNextOption();
          break;
        case "Enter":
          handleValueSelectOnKeyPress();
          break;
      }
    },
    [
      focusPreviousOption,
      focusNextOption,
      handleValueSelectOnKeyPress,
      handleDropdownClick,
    ]
  );

  useLayoutEffect(() => {
    if (page === 1 && !isEmpty(selectOptions)) {
      resetFocus();
    }
  }, [selectOptions]);

  useEffect(() => {
    if (isOpen) {
      focusInput();
    }
  }, [isLoading]);

  return {
    selectState,
    selectStateUpdaters,
    filterSearchedOptions,
    getOriginalOptions,
    preventInputUpdate,
    handlePageReset,
    closeDropdownOnSelect,
    usesInputAsync,
    clearInputOnSelect,
    isLastPage,
    displayedOptions,
    handleOptionsInputFilter,
    closeDropdown,
    selectFocusState,
    selectFocusHandlers,
    selectDomRefs: {
      inputRef,
      selectListContainerRef,
      selectOptionsRef,
      selectTopRef,
    },
    selectEventHandlers: {
      handleClearIndicatorClick,
      handleValueSelectOnKeyPress,
      handleKeyDown,
      handleDropdownClick,
      handleInputChange,
      handleOptionClick,
      handleValueClearClick,
    },
    onOptionSelect,
    focusInput,
    loadNextPage,
    setOriginalOptions,
    getSelectOptionsMap,
  };
};

export default useSelect;
