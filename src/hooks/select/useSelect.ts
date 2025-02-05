import {
  useCallback,
  useRef,
  useEffect,
  Dispatch,
  useMemo,
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
  SelectKeyboardNavigationDirection,
  SelectStateSetters,
  CustomPreventInputUpdate,
  PreventInputUpdate,
  SelectFetchFunc,
  OptionClickHandler,
} from "src/components/Select/types";
import {
  filter,
  isArray,
  isEmpty,
  isFunction,
  slice,
  head,
  isObject,
  find,
  isNil,
  trim,
} from "lodash";
import {
  calculateSpaceAndDisplayOptionList,
  filterOptionListBySearchValue,
  getFirstOptionAndCategory,
} from "src/utils/select";
import { SelectDomHelpers } from "./useSelectDomHelper";
import { getObjectKeys } from "src/utils/data-types/objects/helpers";

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
  onDropdownExpand: () => void;
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
    onOptionSelect: ((option: SelectOptionT) => void) | undefined;
    useInputAsync: boolean;
    selectListContainerRef: React.RefObject<HTMLDivElement>;
    focusInput: () => void;
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
    inputUpdateDebounceDuration,
    removeSelectedOptionsFromList,
    onOptionSelect,
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

  const onClearValue = (optionId: keyof SelectOptionT) => {
    setValue((prevState) =>
      filter(prevState, (option) => option.id !== optionId)
    );
  };

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

  const setInputValue = (value: string) =>
    dispatch({ type: SelectReducerActionTypes.SET_INPUT, payload: value });

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
    isFunction(onOptionSelect) && onOptionSelect(option);
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
    handlePageChange,
    hasMoreData,
    clearInputOnSelect,
    onDropdownExpand,
  };
};

export default useSelect;
