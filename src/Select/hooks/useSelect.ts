import { useCallback, useRef, useEffect, useMemo } from "react";
import {
  SelectOptionList,
  CategorizedSelectOptions,
  SelectOptionT,
  CustomPreventInputUpdate,
  CustomSelectCategorizeFunction,
  SelectSorterFunction,
  SelectFetchFunction,
} from "src/Select/types/selectGeneralTypes";
import {
  SelectState,
  SelectStateUpdaters,
  SelectApi,
} from "src/Select/types/selectStateTypes";
import {
  cloneDeep,
  filter,
  has,
  isEmpty,
  isFunction,
  isNil,
  reduce,
  slice,
  trim,
} from "lodash";
import {
  calculateSpaceAndDisplayOptionList,
  categorizeOptions,
  filterDataBySelectedValues,
  filterOptionListBySearchValue,
  isFocusedOptionInViewport,
  scrollToTarget,
} from "src/utils/select";
import {
  FALLBACK_CATEGORY_NAME,
  NO_CATEGORY_KEY,
} from "src/utils/select/constants";

const useSelect = (
  selectState: SelectState,
  selectStateUpdaters: SelectStateUpdaters,
  selectProps: {
    isMultiValue: boolean;
    labelKey: keyof SelectOptionT;
    fetchOnInputChange: boolean;
    disableInputUpdate: boolean;
    closeDropdownOnSelect: boolean | undefined;
    clearInputOnSelect: boolean | undefined;
    preventInputUpdate: CustomPreventInputUpdate;
    fetchOnScroll: boolean | undefined;
    hasInput: boolean;
    categoryKey: (keyof SelectOptionT & string) | undefined;
    removeSelectedOptionsFromList: boolean;
    sortFunction: SelectSorterFunction | undefined;
    customCategorizeFunction?: CustomSelectCategorizeFunction;
    recordsPerPage?: number;
    fetchFunction: SelectFetchFunction | undefined;
    isLoading: boolean | undefined;
    inputUpdateDebounceDuration?: number;
    isCategorized?: boolean;
    inputFilterFunction?: (
      selectOptions: SelectOptionList,
      inputValue: string
    ) => SelectOptionList;
  }
): SelectApi => {
  const {
    isCategorized,
    recordsPerPage,
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
    hasInput,
    customCategorizeFunction,
    preventInputUpdate: customPreventInputUpdate,
    clearInputOnSelect: customClearInputOnSelect,
    closeDropdownOnSelect: customCloseDropdownOnSelect,
    sortFunction,
  } = selectProps;

  const {
    clearValue,
    closeDropdown,
    clearInput,
    selectValue,
    clearAllValues,
    setSelectOptions,
    setInputValue,
    resetPage,
  } = selectStateUpdaters;

  const { inputValue, page, selectOptions, value } = selectState;

  // #REFS
  // The originalOptions ref is only used in case all the data for the select comes from the frontend, enabling the partitioning of the options while storing the original value that never changes.
  const originalOptionsRef = useRef<SelectOptionList>(selectOptions);

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
      return defaultPreventInputUpdate(updatedValue);
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
  }, [focusInput]);

  // TODO REFACTOR MAYBEEE (CHANGE NAME)
  const hasMoreData = useCallback(() => {
    const totalRecords = getOriginalOptions()?.length;
    if (totalRecords && recordsPerPage) {
      return page * recordsPerPage < totalRecords;
    }
    return false;
  }, [page, recordsPerPage]);

  const loadNextPage = useCallback(() => {
    if (hasMoreData()) {
      selectStateUpdaters.loadNextPage();
    }
  }, [hasMoreData]);

  const handlePageReset = useCallback(() => {
    if (!fetchOnScroll && recordsPerPage) {
      resetPage();
    }
  }, [fetchOnScroll, recordsPerPage]);

  const handleInputChange = useCallback(
    (inputValue: string) => {
      setInputValue(inputValue);
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
      inputValue && clearInput();
      focusInput();
    },
    [inputValue, value, isLoading]
  );

  const handleOptionClick = (option: SelectOptionT, isSelected: boolean) => {
    if (isLoading) return;
    if (!removeSelectedOptionsFromList && isSelected) {
      clearValue(option.id);
    } else {
      selectValue(option);
    }
    clearInputOnSelect && clearInput();
    if (!closeDropdownOnSelect) {
      focusInput();
    } else {
      closeDropdown();
    }
  };

  const handleValueClearClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    optionId: string
  ) => {
    e.stopPropagation();
    clearValue(optionId);
  };

  const filterSearchedOptions = useCallback(() => {
    const originalOptions = getOriginalOptions();
    const filteredOptions = isFunction(customInputFilterFunction)
      ? customInputFilterFunction(originalOptions, inputValue)
      : filterOptionListBySearchValue(originalOptions, labelKey, inputValue);
    setSelectOptions(filteredOptions);
  }, [selectOptions, inputValue]);

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

  // TODO - see to this yea
  useEffect(() => {
    focusInput();
  }, [selectOptions]);

  return {
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
    selectDomRefs: {
      inputRef,
      selectListContainerRef,
      selectOptionRef,
      selectOptionsRef,
    },
    selectEventHandlers: {
      handleClearIndicatorClick,
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
