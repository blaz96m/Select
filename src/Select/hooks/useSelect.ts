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
  CustomSelectCategorizeFunction,
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
import { isEmpty, isFunction, isNil, isNumber, slice, trim } from "lodash";
import {
  categorizeOptions,
  filterOptionList,
  filterOptionListBySearchValue,
  initializeState,
  isFocusedOptionIndexValid,
  isOptionListInViewPort,
} from "src/Select/utils";
import { NO_CATEGORY_KEY } from "src/Select/utils/constants";
import { selectReducer } from "src/Select/stores/selectReducer";
import { useSelectFocus, useSelectStateResolver } from "src/Select/hooks";

const useSelect = (selectProps: {
  isMultiValue: boolean;
  customState: CustomState;
  customStateSetters: CustomStateSetters;
  labelKey: keyof SelectOptionT;
  fetchOnInputChange: boolean;
  disableInputEffect: boolean;
  clearInputOnIdicatorClick: boolean;
  value: SelectOptionList;
  defaultSelectOptions?: SelectOptionList;
  optionFilter?: SelectOptionFilter;
  closeDropdownOnSelect: boolean | undefined;
  clearInputOnSelect: boolean | undefined;
  preventInputUpdate?: CustomPreventInputUpdate;
  clearValueOnInputChange: boolean;
  fetchOnScroll: boolean | undefined;
  hasInput: boolean;
  useAsync: boolean;
  categoryKey: (keyof SelectOptionT & string) | undefined;
  removeSelectedOptionsFromList: boolean;
  sortFunction: SelectSorterFunction | undefined;
  customCategorizeFunction?: CustomSelectCategorizeFunction;
  debounceInputUpdate: boolean;
  inputUpdateDebounceDuration: number;
  recordsPerPage?: number;
  isLoading: boolean | undefined;
  isCategorized: boolean;

  inputFilterFunction?: (
    /* eslint-disable-next-line*/
    selectOptions: SelectOptionList,
    /* eslint-disable-next-line*/
    inputValue: string
  ) => SelectOptionList;
}): SelectApi => {
  const {
    isCategorized,
    customState,
    customStateSetters,
    recordsPerPage,
    defaultSelectOptions,
    value,
    useAsync,
    disableInputEffect,
    optionFilter,
    categoryKey,
    isMultiValue,
    labelKey,
    fetchOnScroll,
    inputUpdateDebounceDuration,
    debounceInputUpdate,
    inputFilterFunction: customInputFilterFunction,
    removeSelectedOptionsFromList,
    isLoading,
    fetchOnInputChange,
    clearInputOnIdicatorClick,
    hasInput,
    customCategorizeFunction,
    preventInputUpdate: customPreventInputUpdate,
    clearInputOnSelect: customClearInputOnSelect,
    closeDropdownOnSelect: customCloseDropdownOnSelect,
    sortFunction,
    clearValueOnInputChange,
  } = selectProps;

  // #STATE RESOLVER

  const [defaultSelectState, dispatch] = useReducer(
    selectReducer,
    defaultSelectOptions,
    initializeState
  );

  const resolvedStateData = useSelectStateResolver(
    { ...defaultSelectState, value },
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

  const { inputValue, page, selectOptions, isOpen } = selectState;

  // #REFS
  // The originalOptions ref is only used in case all the data for the select comes from the frontend, enabling the partitioning of the options while storing the original value that never changes.
  const originalOptionsRef = useRef<SelectOptionList>(selectOptions);

  const hasPaging =
    (isNumber(recordsPerPage) && recordsPerPage > 0) ||
    (useAsync && fetchOnScroll);

  const selectListContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectOptionsRef = useRef<Map<string, HTMLDivElement> | null>(null);
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
    if (!useAsync && recordsPerPage && !isEmpty(selectState.selectOptions)) {
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
  }, [partitionedOptions, value, removeSelectedOptionsFromList]);

  const sortedOptions = useMemo((): SelectOptionList => {
    return isFunction(sortFunction)
      ? sortFunction(filteredOptions)
      : filteredOptions;
  }, [filteredOptions, sortFunction]);

  const categorizedOptions = useMemo((): CategorizedSelectOptions | null => {
    if (isCategorized && !categoryKey) throw new Error(NO_CATEGORY_KEY);
    const options = sortedOptions;
    const res = isCategorized
      ? isFunction(customCategorizeFunction)
        ? customCategorizeFunction(options)
        : categorizeOptions(options, categoryKey as keyof SelectOptionT)
      : null;
    return res;
  }, [isCategorized, sortedOptions, customCategorizeFunction]);

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

  const usesInputAsync = useAsync && fetchOnInputChange;

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
    return false;
  }, [page, recordsPerPage, selectOptions]);

  const handleValueSelectOnKeyPress = useCallback(() => {
    if (
      !isFocusedOptionIndexValid(focusedOptionIndex) ||
      (isCategorized && !focusedOptionCategory) ||
      isEmpty(displayedOptions)
    )
      return;

    const targetOption = isCategorized
      ? (displayedOptions as CategorizedSelectOptions)[focusedOptionCategory][
          focusedOptionIndex!
        ]
      : (displayedOptions as SelectOptionList)[focusedOptionIndex!];

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
    }
  }, [handleOptionFocusOnSelectByKeyPress, onOptionSelect]);

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

  const handleInputChange = useCallback(
    (inputValue: string) => {
      setInputValue(inputValue);
      !isOpen && openDropdown();
      if (!isMultiValue && clearValueOnInputChange && !isEmpty(value)) {
        clearAllValues();
      }
      !debounceInputUpdate && handleOptionsFilter(inputValue);
    },
    [isMultiValue, clearValueOnInputChange, isOpen, value, debounceInputUpdate]
  );

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
    [inputValue, value, isLoading, clearInputOnIdicatorClick]
  );

  const handleDropdownClick = useCallback(() => {
    if (isLoading) return;
    const willOpen = !isOpen;
    toggleDropdownVisibility();
    willOpen ? focusInput() : resetFocus();
  }, [isLoading, isOpen, toggleDropdownVisibility, resetFocus]);

  const clearSelectOptionFilter = useCallback(() => {
    const originalOptions = getOriginalOptions();
    setSelectOptions(originalOptions);
    onAfterOptionFilter("");
  }, []);

  const handleOptionClick = useCallback(
    (option: SelectOptionT, isSelected: boolean) => {
      if (isLoading) return;
      onOptionSelect(isSelected, option);
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
    },
    [
      closeDropdown,
      focusInput,
      resetFocus,
      isLoading,
      onOptionSelect,
      debounceInputUpdate,
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

  const filterSearchedOptions = useCallback(
    (inputValue: string) => {
      const originalOptions = getOriginalOptions();
      const filteredOptions = isFunction(customInputFilterFunction)
        ? customInputFilterFunction(originalOptions, inputValue)
        : filterOptionListBySearchValue(originalOptions, labelKey, inputValue);
      setSelectOptions(filteredOptions);
      onAfterOptionFilter(inputValue);
    },
    [selectOptions, customInputFilterFunction]
  );

  // Gets passed to the useEffect of the input component, will not run if async search is enabled
  const handleOptionsFilter = useCallback(
    (inputValue: string) => {
      const inputUpdated = inputValue !== previousInputValueRef.current;
      if (
        usesInputAsync ||
        disableInputEffect ||
        (debounceInputUpdate && !inputUpdated)
      )
        return;
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
      disableInputEffect,
      inputUpdateDebounceDuration,
    ]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.code) {
        case "ArrowUp":
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
    if (!isEmpty(selectOptions) && isOpen) {
      const selectOptionListNode = selectListContainerRef.current;
      if (!isOptionListInViewPort(selectOptionListNode)) {
        window.scrollTo({
          top: selectOptionListNode?.getBoundingClientRect()?.bottom,
        });
      }
    }
  }, [selectOptions, isOpen]);

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
    handleOptionsFilter,
    selectFocusState,
    selectFocusHandlers,
    selectDomRefs: {
      inputRef,
      selectListContainerRef,
      selectOptionsRef,
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
