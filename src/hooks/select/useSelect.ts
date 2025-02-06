import {
  useCallback,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import {
  SelectReducerDispatch,
  SelectReducerActionTypes,
} from "src/stores/reducers/selectReducer";
import {
  SelectOptionList,
  CategorizedSelectOptions,
  SelectOptionT,
  SelectState,
  SelectStateSetters,
  CustomPreventInputUpdate,
  PreventInputUpdate,
  SelectFetchFunc,
  OptionClickHandler,
  HandleValueClear,
  HandleClearIndicatorClick,
} from "src/components/Select/types";
import { filter, isEmpty, isFunction, isNil, trim } from "lodash";
import {
  calculateSpaceAndDisplayOptionList,
  filterOptionListBySearchValue,
} from "src/utils/select";
import { SelectDomHelpers } from "./useSelectDomHelper";

type StateSetter<T> = Dispatch<SetStateAction<T>>;

type CustomSelectStateSetters = {
  setValue: StateSetter<SelectOptionList>;
  setOptions?: StateSetter<SelectOptionList>;
};

export type SelectApi = {
  getSelectStateSetters: () => SelectStateSetters;
  hasMoreData: () => boolean;
  setInputValue: (value: string) => void;
  handleInputUpdatePrevention: PreventInputUpdate;
  handleOptionsSearchTrigger: () => void;
  onDropdownClick: (isOpen: boolean) => void;
  toggleDropdown: () => void;
  onDropdownExpand: () => void;
  handleClearIndicatorClick: HandleClearIndicatorClick;
  onInputUpdate: () => void;
  handleValueClear: HandleValueClear;
  handlePageChange: () => void;
  filterSearchedOptions: () => void;
  clearInputOnSelect: boolean;
  onOptionClick: OptionClickHandler;
};

const useSelect = (
  dispatch: SelectReducerDispatch,
  customStateUpdaters: CustomSelectStateSetters,
  selectState: SelectState & {
    displayedOptions: SelectOptionList | CategorizedSelectOptions;
    originalOptions: SelectOptionList;
    totalRecords: number;
  },
  selectDomHelpers: SelectDomHelpers,
  selectProps: {
    isMultiValue: boolean;
    labelKey: keyof SelectOptionT;
    categoryKey: keyof SelectOptionT & string;
    closeDropdownOnSelect: boolean | undefined;
    hasInput: boolean;
    useInputAsync: boolean;
    selectListContainerRef: React.RefObject<HTMLDivElement>;
    focusInput: () => void;
    onDropdownCollapse: (() => void) | undefined;
    onValueClear: HandleValueClear;
    clearInputOnSelect: boolean | undefined;
    disableInputUpdate: boolean;
    removeSelectedOptionsFromList: boolean;
    recordsPerPage?: number;
    fetchFunction?: SelectFetchFunc;
    preventInputUpdate?: CustomPreventInputUpdate;
    onDropdownExpand?: () => void;
    isLoading: boolean | undefined;
    inputUpdateDebounceDuration?: number;
    isCategorized?: boolean;
    inputFilterFunction?: (
      selectOptions: SelectOptionList,
      inputValue: string
    ) => SelectOptionList;
  }
): SelectApi => {
  const { setValue } = customStateUpdaters;
  const {
    isCategorized,
    recordsPerPage,
    categoryKey,
    selectListContainerRef,
    isMultiValue,
    labelKey,
    fetchFunction,
    useInputAsync,
    inputFilterFunction,
    onDropdownCollapse,
    removeSelectedOptionsFromList,
    onValueClear: customOnClearValue,
    isLoading,
    disableInputUpdate,
    preventInputUpdate,
    onDropdownExpand: customOnDropdownExpand,
    clearInputOnSelect: customClearInputOnSelect,
    closeDropdownOnSelect: customCloseDropdownOnSelect,
    hasInput,
    focusInput,
  } = selectProps;

  const totalRecords =
    selectState.totalRecords || selectState.originalOptions.length;
  const hasCategories = isCategorized && !isEmpty(categoryKey);
  const usesAsyncSearchFilter = isFunction(fetchFunction) && useInputAsync;

  const selectStateSettersRef = useRef<null | SelectStateSetters>(null);

  const onSelectValue = (option: SelectOptionT) =>
    setValue((prevState) => (isMultiValue ? [...prevState, option] : [option]));

  const onClearValue = useCallback((optionId: keyof SelectOptionT) => {
    setValue((prevState) =>
      filter(prevState, (option) => option.id !== optionId)
    );
  }, []);

  const defaultInputUpdatePreventer = useCallback(
    (updatedValue: string) =>
      (!trim(updatedValue) && !selectState.inputValue) || !hasInput,
    [hasInput, selectState.inputValue]
  );

  const handleInputUpdatePrevention = useCallback(
    (updatedValue: string) => {
      if (disableInputUpdate) return true;
      if (isFunction(preventInputUpdate))
        return preventInputUpdate(updatedValue, selectState.inputValue);
      return defaultInputUpdatePreventer(updatedValue);
    },
    [selectState.inputValue, hasInput, preventInputUpdate]
  );

  const onClearAllValues = () => {
    setValue((prevState) => (isEmpty(prevState) ? prevState : []));
  };

  const toggleDropdown = useCallback(
    () => dispatch({ type: SelectReducerActionTypes.TOGGLE_VISIBILTY }),
    []
  );

  const setInputValue = useCallback(
    (value: string) =>
      dispatch({ type: SelectReducerActionTypes.SET_INPUT, payload: value }),
    []
  );

  const clearInput = useCallback(() => {
    dispatch({ type: SelectReducerActionTypes.CLEAR_INPUT });
  }, []);

  const closeDropdownOnSelectDefault = isMultiValue ? false : true;

  const closeDropdownOnSelect = isNil(customCloseDropdownOnSelect)
    ? closeDropdownOnSelectDefault
    : customCloseDropdownOnSelect;

  const defaultClearInputOnSelect = isMultiValue ? false : true;

  const clearInputOnSelect = isNil(customClearInputOnSelect)
    ? defaultClearInputOnSelect
    : customClearInputOnSelect;

  if (!selectStateSettersRef.current) {
    selectStateSettersRef.current = {
      openDropdown: () => dispatch({ type: SelectReducerActionTypes.OPEN }),
      closeDropdown: () => dispatch({ type: SelectReducerActionTypes.CLOSE }),
      toggleDropdown: () =>
        dispatch({ type: SelectReducerActionTypes.TOGGLE_VISIBILTY }),
      setInputValue,
      clearInput: () =>
        dispatch({ type: SelectReducerActionTypes.CLEAR_INPUT }),
      selectValue: (option) => onSelectValue(option),
      clearValue: (optionId) => onClearValue(optionId),
      clearAllValues: () => onClearAllValues(),
      setOptions: (options) => {
        dispatch({
          type: SelectReducerActionTypes.SET_OPTIONS,
          payload: options,
        });
      },
      addOptions: (options) =>
        dispatch({
          type: SelectReducerActionTypes.ADD_OPTION_LISTS,
          payload: options,
        }),
      loadNextPage: () =>
        dispatch({ type: SelectReducerActionTypes.GO_TO_NEXT_PAGE }),
      setFocusDetails: (focusedOptionId, focusedCategory) =>
        dispatch({
          type: SelectReducerActionTypes.SET_FOCUSED_OPTION,
          payload: { focusedOptionId, focusedCategory },
        }),
    };
  }

  const getSelectStateSetters = useCallback(
    () => selectStateSettersRef.current as SelectStateSetters,
    []
  );

  const onDropdownExpand = useCallback(() => {
    const selectListContainer = selectListContainerRef.current;
    focusInput();
    selectListContainer &&
      calculateSpaceAndDisplayOptionList(selectListContainer);
    isFunction(customOnDropdownExpand) && customOnDropdownExpand();
  }, []);

  const hasMoreData = useCallback(() => {
    if (totalRecords && recordsPerPage) {
      return selectState.page * recordsPerPage < totalRecords;
    }
    return false;
  }, [selectState.page, recordsPerPage, totalRecords]);

  const handlePageChange = useCallback(() => {
    const selectStateSetters = getSelectStateSetters();
    if (hasMoreData()) {
      selectStateSetters.loadNextPage();
    }
  }, [hasMoreData]);

  const onInputUpdate = useCallback(() => {
    const { openDropdown, clearAllValues } = getSelectStateSetters();
    openDropdown();
    if (!isMultiValue && clearInputOnSelect) {
      clearAllValues();
    }
  }, [isMultiValue, clearInputOnSelect]);

  const onDropdownClick = (isOpen: boolean) => {
    if (isLoading) return;
    if (isOpen) {
      return onDropdownExpand();
    }
    isFunction(onDropdownCollapse) && onDropdownCollapse();
  };

  const handleClearIndicatorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (isLoading) return;
      e.stopPropagation();
      const { clearAllValues } = getSelectStateSetters();
      !isEmpty(selectState.value) && clearAllValues();
      selectState.inputValue && clearInput();
      focusInput();
    },
    [selectState.inputValue, selectState.value, isLoading]
  );

  const onOptionClick = (
    option: SelectOptionT,
    optionIndex: number,
    isSelected: boolean,
    handleOptionFocusAfterClick: (
      optionIndex: number,
      optionCategory: string
    ) => void
  ) => {
    if (isLoading) return;
    const optionCategory = hasCategories ? option[categoryKey] : "";
    const { clearValue, selectValue, clearInput, closeDropdown } =
      getSelectStateSetters();
    !removeSelectedOptionsFromList && isSelected
      ? clearValue(option.id)
      : selectValue(option);
    clearInputOnSelect && clearInput();
    if (!closeDropdownOnSelect) {
      focusInput();
      handleOptionFocusAfterClick(optionIndex, optionCategory);
    } else {
      closeDropdown();
    }
  };

  const handleValueClear = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    optionId: string
  ) => {
    e.stopPropagation();
    onClearValue(optionId);
    isFunction(customOnClearValue) && customOnClearValue(e, optionId);
  };

  const filterSearchedOptions = useCallback(() => {
    const selectStateSetters = getSelectStateSetters();
    const filteredOptions = isFunction(inputFilterFunction)
      ? inputFilterFunction(selectState.originalOptions, selectState.inputValue)
      : filterOptionListBySearchValue(
          selectState.originalOptions,
          labelKey,
          selectState.inputValue
        );
    selectStateSetters.setOptions(filteredOptions);
  }, [selectState.selectOptions, selectState.inputValue]);

  const handleOptionsSearchTrigger = useCallback(() => {
    if (usesAsyncSearchFilter) return;
    if (!selectState.inputValue) {
      return filterSearchedOptions();
    }
    const timeoutId = setTimeout(() => {
      filterSearchedOptions();
    }, 600);
    return timeoutId;
  }, [useInputAsync, fetchFunction, filterSearchedOptions]);

  // TODO - see to this yea
  useEffect(() => {
    selectDomHelpers.focusInput();
  }, [selectState.selectOptions]);

  return {
    getSelectStateSetters,
    filterSearchedOptions,
    setInputValue,
    handleOptionsSearchTrigger,
    handleInputUpdatePrevention,
    onOptionClick,
    handleValueClear,
    handlePageChange,
    onDropdownExpand,
    hasMoreData,
    handleClearIndicatorClick,
    clearInputOnSelect,
    onDropdownClick,
    toggleDropdown,
    onInputUpdate,
  };
};

export default useSelect;
