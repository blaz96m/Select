import { useCallback, useRef, useEffect, useMemo, useReducer } from "react";
import {
  SelectOptionList,
  CategorizedSelectOptions,
  SelectOptionT,
  CustomPreventInputUpdate,
  CustomSelectCategorizeFunction,
  SelectSorterFunction,
  SelectFetchFunction,
  SelectKeyboardNavigationDirection,
  SelectFocusNavigationFallbackDirection,
} from "src/Select/types/selectGeneralTypes";

import {
  SelectState,
  SelectStateUpdaters,
  SelectApi,
  CustomState,
  CustomStateSetters,
} from "src/Select/types/selectStateTypes";
import {
  cloneDeep,
  filter,
  has,
  isEmpty,
  isFunction,
  isNil,
  isNumber,
  isObject,
  reduce,
  slice,
  trim,
} from "lodash";
import {
  calculateSpaceAndDisplayOptionList,
  categorizeOptions,
  filterDataBySelectedValues,
  filterOptionListBySearchValue,
  initializeState,
  isFocusedOptionInViewport,
  isFocusedOptionIndexValid,
  scrollToTarget,
} from "src/Select/utils";
import {
  FALLBACK_CATEGORY_NAME,
  NO_CATEGORY_KEY,
} from "src/Select/utils/constants";
import {
  SelectReducerDispatch,
  selectReducer,
} from "src/Select/stores/selectReducer";
import { useSelectFocus, useSelectStateResolver } from "src/Select/hooks";

const useSelect = (selectProps: {
  isMultiValue: boolean;
  customState: CustomState;
  customStateSetters: CustomStateSetters;
  labelKey: keyof SelectOptionT;
  fetchOnInputChange: boolean;
  clearInputOnIdicatorClick: boolean;
  value: SelectOptionList;
  defaultSelectOptions?: SelectOptionList;
  disableInputUpdate: boolean;
  closeDropdownOnSelect: boolean | undefined;
  clearInputOnSelect: boolean | undefined;
  preventInputUpdate: CustomPreventInputUpdate;
  fetchOnScroll: boolean | undefined;
  hasInput: boolean;
  usesAsync: boolean;
  categoryKey: (keyof SelectOptionT & string) | undefined;
  removeSelectedOptionsFromList: boolean;
  sortFunction: SelectSorterFunction | undefined;
  customCategorizeFunction?: CustomSelectCategorizeFunction;
  recordsPerPage?: number;
  fetchFunction: SelectFetchFunction | undefined;
  isLoading: boolean | undefined;
  inputUpdateDebounceDuration?: number;
  isCategorized: boolean;
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
    value,
    usesAsync,
    categoryKey,
    isMultiValue,
    labelKey,
    fetchFunction,
    fetchOnScroll,
    inputFilterFunction: customInputFilterFunction,
    removeSelectedOptionsFromList,
    isLoading,
    fetchOnInputChange,
    disableInputUpdate,
    clearInputOnIdicatorClick,
    hasInput,
    customCategorizeFunction,
    preventInputUpdate: customPreventInputUpdate,
    clearInputOnSelect: customClearInputOnSelect,
    closeDropdownOnSelect: customCloseDropdownOnSelect,
    sortFunction,
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
    (usesAsync && fetchOnScroll);

  const selectListContainerRef = useRef<HTMLDivElement>(null);
  const selectOptionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectOptionsRef = useRef<Map<string, HTMLDivElement> | null>(null);

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
      !isFunction(fetchFunction) &&
      recordsPerPage &&
      !isEmpty(selectState.selectOptions)
    ) {
      return slice(options, 0, selectState.page * recordsPerPage);
    }
    return options;
  }, [selectState.selectOptions, selectState.page]);

  const categorizedOptions = useMemo((): CategorizedSelectOptions => {
    if (isCategorized && !categoryKey) throw new Error(NO_CATEGORY_KEY);
    const options = partitionedOptions || selectState.selectOptions;
    return isCategorized
      ? isFunction(customCategorizeFunction)
        ? customCategorizeFunction(options)
        : categorizeOptions(options, categoryKey as keyof SelectOptionT)
      : {};
  }, [isCategorized, partitionedOptions, customCategorizeFunction]);

  const filteredOptions = useMemo(():
    | SelectOptionList
    | CategorizedSelectOptions => {
    const options = isCategorized
      ? categorizedOptions
      : partitionedOptions || selectOptions;
    const categoryKeyVal = isCategorized
      ? (categoryKey as keyof SelectOptionT)
      : "";
    return removeSelectedOptionsFromList
      ? filterDataBySelectedValues(options, value, categoryKeyVal)
      : options;
  }, [categorizedOptions, isCategorized, value]);

  const sortedOptions = useMemo(():
    | SelectOptionList
    | CategorizedSelectOptions
    | null => {
    if (isFunction(sortFunction)) {
      return sortFunction(
        isCategorized ? cloneDeep(filteredOptions) : filteredOptions
      );
    }
    return null;
  }, [filteredOptions, sortFunction]);

  const displayedOptions = sortedOptions || filteredOptions;

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
    handleOptionFocusOnSelectByClick,
    resetFocus,
    handleOptionFocusOnSelectByKeyPress,
  } = selectFocusHandlers;

  // #PROP RESOLVERS

  const usesInputAsync = isFunction(fetchFunction) && fetchOnInputChange;

  const defaultPreventInputUpdate = useCallback(
    (updatedValue: string) => (!trim(updatedValue) && !inputValue) || !hasInput,
    [hasInput, inputValue]
  );
  const preventInputUpdate = useCallback(
    (updatedValue: string) => {
      if (disableInputUpdate) return true;
      if (isFunction(customPreventInputUpdate))
        return customPreventInputUpdate(updatedValue, inputValue);
      const res = defaultPreventInputUpdate(updatedValue);
      return res;
    },
    [defaultPreventInputUpdate, customPreventInputUpdate, disableInputUpdate]
  );

  const defaultClearInputOnSelect = isMultiValue ? false : true;
  const clearInputOnSelect = isNil(customClearInputOnSelect)
    ? defaultClearInputOnSelect
    : customClearInputOnSelect;

  const closeDropdownOnSelectDefault = isMultiValue ? false : true;
  const closeDropdownOnSelect = isNil(customCloseDropdownOnSelect)
    ? closeDropdownOnSelectDefault
    : customCloseDropdownOnSelect;

  const fetchOnScrollToBottom = isFunction(fetchFunction) && fetchOnScroll;

  // #EVENT HANDLERS

  const onDropdownExpand = useCallback(() => {
    const selectListContainer = selectListContainerRef.current;
    focusInput();
    selectListContainer &&
      calculateSpaceAndDisplayOptionList(selectListContainer);
  }, [focusInput, focusedOptionIndex, focusedOptionCategory]);

  const onDropdownCollapse = useCallback(() => {
    resetFocus();
  }, [resetFocus]);

  const onOptionSelect = useCallback(
    (isSelected: boolean, option: SelectOptionT) => {
      return isSelected && !removeSelectedOptionsFromList
        ? clearValue(option.id)
        : selectValue(option);
    },
    [removeSelectedOptionsFromList, clearValue, selectValue]
  );

  // TODO REFACTOR MAYBEEE (CHANGE NAME)
  const hasMoreData = useCallback(() => {
    const totalRecords = getOriginalOptions()?.length;
    if (totalRecords && recordsPerPage) {
      return page * recordsPerPage < totalRecords;
    }
    return false;
  }, [page, recordsPerPage]);

  const handleValueSelectOnKeyPress = useCallback(() => {
    if (
      !isFocusedOptionIndexValid(focusedOptionIndex) ||
      (isCategorized && !focusedOptionCategory)
    )
      return;

    const targetOption = isCategorized
      ? (displayedOptions as CategorizedSelectOptions)[focusedOptionCategory][
          focusedOptionIndex!
        ]
      : (displayedOptions as SelectOptionList)[focusedOptionIndex!];

    const selectOptionsMap = getSelectOptionsMap();
    const targetOptionNode = selectOptionsMap.get(targetOption.id);
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
  }, [
    handleOptionFocusOnSelectByKeyPress,
    isCategorized,
    removeSelectedOptionsFromList,
  ]);

  const loadNextPage = useCallback(() => {
    if (hasMoreData()) {
      selectStateUpdaters.loadNextPage();
    }
  }, [hasMoreData]);

  const handlePageReset = useCallback(() => {
    if (hasPaging) {
      resetPage();
    }
  }, [hasPaging, resetPage]);

  const handleInputChange = useCallback(
    (inputValue: string) => {
      setInputValue(inputValue);
      openDropdown();

      if (!isMultiValue && clearInputOnSelect) {
        clearAllValues();
      }
    },
    [isMultiValue, clearInputOnSelect, clearAllValues]
  );

  const getOriginalOptions = () => originalOptionsRef.current;

  const setOriginalOptions = (options: SelectOptionList) =>
    (originalOptionsRef.current = options);

  const handleClearIndicatorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (isLoading) return;
      e.stopPropagation();
      !isEmpty(value) && clearAllValues();
      inputValue && clearInputOnIdicatorClick && clearInput();
      focusInput();
    },
    [inputValue, value, isLoading, clearInputOnIdicatorClick]
  );

  const handleDropdownClick = useCallback(() => {
    if (isLoading) return;
    const willOpen = !isOpen;
    toggleDropdownVisibility();
    willOpen ? onDropdownExpand() : onDropdownCollapse();
  }, [
    isLoading,
    isOpen,
    toggleDropdownVisibility,
    onDropdownExpand,
    onDropdownCollapse,
  ]);

  const handleOptionClick = useCallback(
    (
      option: SelectOptionT,
      isSelected: boolean,
      optionIdx: number,
      optionCategory: string
    ) => {
      if (isLoading) return;
      onOptionSelect(isSelected, option);
      clearInputOnSelect && clearInput();

      if (!closeDropdownOnSelect) {
        focusInput();
        const { focusDirection, focusFallbackDirection } =
          getFocusDirectionsOnSelect(isSelected);
        handleOptionFocusOnSelectByClick(
          optionIdx,
          optionCategory,
          focusDirection,
          focusFallbackDirection
        );
      } else {
        closeDropdown();
        resetFocus();
      }
    },
    [
      closeDropdown,
      focusInput,
      selectValue,
      clearValue,
      resetFocus,
      isLoading,
      removeSelectedOptionsFromList,
    ]
  );

  const handleValueClearClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    optionId: string
  ) => {
    e.stopPropagation();
    clearValue(optionId);
    focusInput();
  };

  const filterSearchedOptions = useCallback(() => {
    const originalOptions = getOriginalOptions();
    const filteredOptions = isFunction(customInputFilterFunction)
      ? customInputFilterFunction(originalOptions, inputValue)
      : filterOptionListBySearchValue(originalOptions, labelKey, inputValue);
    setSelectOptions(filteredOptions);
  }, [selectOptions, inputValue, customInputFilterFunction]);

  // Gets passed to the useEffect of the input component, will not run if async search is enabled
  const handleOptionsSearchTrigger = useCallback(() => {
    if (usesInputAsync) return;
    if (!inputValue) {
      return filterSearchedOptions();
    }
    const timeoutId = setTimeout(() => {
      filterSearchedOptions();
    }, 600);
    return timeoutId;
  }, [usesInputAsync, fetchFunction, filterSearchedOptions]);

  useEffect(() => {
    if (page === 1) {
      resetFocus();
    }
    // Focus input after options load, used for async operations since the input will be disabled if the loading state is provided
    if (isOpen && isFunction(fetchFunction)) {
      focusInput();
    }
  }, [selectOptions, resetFocus]);

  return {
    selectState,
    selectStateUpdaters,
    filterSearchedOptions,
    fetchOnScrollToBottom,
    getOriginalOptions,
    preventInputUpdate,
    handlePageReset,
    closeDropdownOnSelect,
    usesInputAsync,
    clearInputOnSelect,
    displayedOptions,
    handleOptionsSearchTrigger,
    selectFocusState,
    selectFocusHandlers,
    selectDomRefs: {
      inputRef,
      selectListContainerRef,
      selectOptionRef,
      selectOptionsRef,
    },
    selectEventHandlers: {
      handleClearIndicatorClick,
      handleValueSelectOnKeyPress,
      handleDropdownClick,
      handleInputChange,
      handleOptionClick,
      handleValueClearClick,
    },
    focusInput,
    loadNextPage,
    onDropdownExpand,
    setOriginalOptions,
    getSelectOptionsMap,
  };
};

export default useSelect;
