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
  onDropdownExpand: () => void;
  handlePageChange: () => void;
  filterSearchedOptions: () => void;
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
    recordsPerPage?: number;
    closeDropdownOnSelect: boolean | undefined;
    focusInput: () => void;
    onDropdownExpand?: () => void;
    selectListContainerRef: React.RefObject<HTMLDivElement>;
    isCategorized?: boolean;
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
    onDropdownExpand: customOnDropdownExpand,
    focusInput,
  } = selectProps;

  const totalRecords =
    selectState.totalRecords || selectState.originalOptions.length;
  const hasCategories = isCategorized && !isEmpty(categoryKey);

  const selectStateSettersRef = useRef<null | SelectStateSetters>(null);

  const onSelectValue = (
    option: SelectOptionT,
    dispatch: SelectReducerDispatch
  ) => {
    const closeDropdown = shouldCloseDropdownOnSelect();

    setValue((prevState) => (isMultiValue ? [...prevState, option] : [option]));
    if (closeDropdown) {
      dispatch({ type: SelectReducerActionTypes.CLOSE });
    }
  };

  const onClearValue = (optionId: keyof SelectOptionT) => {
    setValue((prevState) =>
      filter(prevState, (option) => option.id !== optionId)
    );
  };

  const onClearAllValues = () => {
    setValue((prevState) => (isEmpty(prevState) ? prevState : []));
  };

  const shouldCloseDropdownOnSelect = () => {
    const { closeDropdownOnSelect, isMultiValue } = selectProps;
    //DEFAULT behaviour if the closeDropdownOnOptionSelect prop is not specified
    if (isNil(closeDropdownOnSelect)) {
      return isMultiValue ? false : true;
    }
    return closeDropdownOnSelect;
  };

  if (!selectStateSettersRef.current) {
    selectStateSettersRef.current = {
      openDropdown: () => dispatch({ type: SelectReducerActionTypes.OPEN }),
      closeDropdown: () => dispatch({ type: SelectReducerActionTypes.CLOSE }),
      toggleDropdown: () =>
        dispatch({ type: SelectReducerActionTypes.TOGGLE_VISIBILTY }),
      setInputValue: (value) =>
        dispatch({ type: SelectReducerActionTypes.SET_INPUT, payload: value }),
      clearInput: () =>
        dispatch({ type: SelectReducerActionTypes.CLEAR_INPUT }),
      selectValue: (option) => onSelectValue(option, dispatch),
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

  const filterSearchedOptions = useCallback(() => {
    const selectStateSetters = getSelectStateSetters();
    const filteredOptions = filterOptionListBySearchValue(
      selectState.originalOptions,
      selectProps.labelKey,
      selectState.inputValue
    );
    selectStateSetters.setOptions(filteredOptions);
  }, [selectState.selectOptions, selectState.inputValue]);

  useEffect(() => {
    selectDomHelpers.focusInput();
  }, [selectState.selectOptions]);

  return {
    getSelectStateSetters,
    filterSearchedOptions,
    handlePageChange,
    hasMoreData,
    onDropdownExpand,
  };
};

export default useSelect;
