import {
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useReducer,
  ChangeEvent,
  KeyboardEvent,
} from "react";
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
  SelectOptionFilter,
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
  filterListBySelectedValues,
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
  disableInputEffect: boolean;
  clearInputOnIdicatorClick: boolean;
  value: SelectOptionList;
  defaultSelectOptions?: SelectOptionList;
  disableInputUpdate: boolean;
  optionFilter?: SelectOptionFilter;
  closeDropdownOnSelect: boolean | undefined;
  clearInputOnSelect: boolean | undefined;
  preventInputUpdate: CustomPreventInputUpdate;
  fetchOnScroll: boolean | undefined;
  hasInput: boolean;
  useAsync: boolean;
  categoryKey: (keyof SelectOptionT & string) | undefined;
  removeSelectedOptionsFromList: boolean;
  sortFunction: SelectSorterFunction | undefined;
  customCategorizeFunction?: CustomSelectCategorizeFunction;
  recordsPerPage?: number;
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
    useAsync,
    disableInputEffect,
    optionFilter,
    categoryKey,
    isMultiValue,
    labelKey,
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
    (useAsync && fetchOnScroll);

  const selectListContainerRef = useRef<HTMLDivElement>(null);
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
    if (!useAsync && recordsPerPage && !isEmpty(selectState.selectOptions)) {
      return slice(options, 0, selectState.page * recordsPerPage);
    }
    return options;
  }, [selectState.selectOptions, selectState.page]);

  const filteredOptions = useMemo((): SelectOptionList => {
    const options = partitionedOptions || selectOptions;
    return filterListBySelectedValues(
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
    handleOptionFocusOnSelectByClick,
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
      if (disableInputUpdate) return true;
      if (isFunction(customPreventInputUpdate))
        return customPreventInputUpdate(e, updatedValue, inputValue);
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

  // #EVENT HANDLERS

  const onDropdownExpand = useCallback(() => {
    const selectListContainer = selectListContainerRef.current;
    focusInput();
    selectListContainer &&
      calculateSpaceAndDisplayOptionList(selectListContainer);
  }, [focusInput, focusedOptionIndex, focusedOptionCategory]);

  const onDropdownCollapse = useCallback(() => {
    console.log("CALLED");
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
  const isLastPage = useCallback(() => {
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
  }, [handleOptionFocusOnSelectByKeyPress, onOptionSelect]);

  const loadNextPage = useCallback(() => {
    if (isLastPage()) {
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

      if (!isMultiValue && clearInputOnSelect && !isEmpty(value)) {
        clearAllValues();
      }
    },
    [isMultiValue, clearInputOnSelect, isOpen, value]
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
    [closeDropdown, focusInput, resetFocus, isLoading, onOptionSelect]
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
    if (usesInputAsync || disableInputEffect) return;
    if (!inputValue) {
      return filterSearchedOptions();
    }
    const timeoutId = setTimeout(() => {
      filterSearchedOptions();
    }, 600);
    return timeoutId;
  }, [usesInputAsync, filterSearchedOptions, disableInputEffect]);

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
    handleOptionsSearchTrigger,
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
    focusInput,
    loadNextPage,
    onDropdownExpand,
    setOriginalOptions,
    getSelectOptionsMap,
  };
};

export default useSelect;
