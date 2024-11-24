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
  SelectFocusDetails,
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
  filterOptionListBySearchValue,
  getFirstOptionAndCategory,
  getLastOptionAndCategory,
  getOptionFocusDetailsOnNavigation,
} from "src/utils/select";
import { SelectRefHelpers } from "./useSelectRef";
import { getObjectKeys } from "src/utils/data-types/objects/helpers";

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

type StateSetter<T> = Dispatch<SetStateAction<T>>;

type CustomSelectStateSetters = {
  setValue: StateSetter<SelectOptionList>;
  setOptions?: StateSetter<SelectOptionList>;
};

export type SelectApi = {
  getSelectStateSetters: () => SelectStateSetters;
  getFocusValues: (
    direction: SelectKeyboardNavigationDirection
  ) => SelectFocusDetails | null;
  focusLastOption: () => void;
  focusFirstOption: () => void;
  hasMoreData: () => boolean;
  handlePageChange: () => void;
  focusOptionAfterClick: (
    optionId: string,
    optionCategory?: keyof SelectOptionT
  ) => void;
  filterSearchedOptions: () => void;
  addOptionOnKeyPress: () => void;
};

const useSelect = (
  dispatch: SelectReducerDispatch,
  customStateUpdaters: CustomSelectStateSetters,
  selectState: SelectState & {
    displayedOptions: SelectOptionList | CategorizedSelectOptions;
    originalOptions: SelectOptionList;
    totalRecords: number;
  },
  selectRefHelpers: SelectRefHelpers,
  selectProps: {
    isMultiValue: boolean;
    labelKey: keyof SelectOptionT;
    isCategorized: boolean;
    categoryKey: keyof SelectOptionT & string;
    recordsPerPage: number | null;
    closeDropdownOnOptionSelect?: boolean;
  }
): SelectApi => {
  const { setValue } = customStateUpdaters;
  const { isCategorized, recordsPerPage, categoryKey } = selectProps;

  const totalRecords =
    selectState.totalRecords || selectState.originalOptions.length;
  const hasCategories = isCategorized && categoryKey;

  const selectStateSettersRef = useRef<null | SelectStateSetters>(null);

  const onAddValue = (
    option: SelectOptionT,
    dispatch: SelectReducerDispatch
  ) => {
    console.log("CALLED");
    const closeDropdown = shouldCloseDropdownOnSelect();
    setValue((prevState) =>
      selectProps.isMultiValue ? [...prevState, option] : [option]
    );
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
    const { closeDropdownOnOptionSelect, isMultiValue } = selectProps;
    //DEFAULT behaviour if the closeDropdownOnOptionSelect prop is not specified
    if (isNil(closeDropdownOnOptionSelect)) {
      return isMultiValue ? false : true;
    }
    return closeDropdownOnOptionSelect;
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
      addValue: (option) => onAddValue(option, dispatch),
      clearValue: (optionId) => onClearValue(optionId),
      clearAllValues: () => onClearAllValues(),
      setOptions: (options) =>
        dispatch({
          type: SelectReducerActionTypes.SET_OPTIONS,
          paylod: options,
        }),
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

  const getFocusValues = useCallback(
    (
      direction: SelectKeyboardNavigationDirection,
      focusedOptionId = selectState.focusedOptionId,
      focusedCategory = selectState.focusedCategory
    ): SelectFocusDetails | null => {
      const focusDetails = getOptionFocusDetailsOnNavigation(
        focusedOptionId,
        selectState.displayedOptions,
        direction,
        focusedCategory
      );
      return focusDetails;
    },
    [
      selectState.focusedCategory,
      selectState.focusedOptionId,
      selectState.displayedOptions,
    ]
  );

  const focusLastOption = useCallback(() => {
    if (isEmpty(selectState.displayedOptions)) return;
    const selectStateSetters = getSelectStateSetters();
    if (hasCategories) {
      const focusDetails = getLastOptionAndCategory(
        selectState.displayedOptions as CategorizedSelectOptions
      );

      !isEmpty(focusDetails) &&
        selectStateSetters.setFocusDetails(
          focusDetails.focusedOptionId,
          focusDetails.focusedCategory
        );

      return focusDetails?.focusedOptionId;
    }
    const lastOption = (selectState.displayedOptions as SelectOptionList).slice(
      -1
    )[0];
    selectStateSetters.setFocusDetails(lastOption.id);
    return lastOption.id;
  }, [selectState.displayedOptions]);

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

  const focusOptionAfterClick = useCallback(
    (optionId: string, optionCategory?: keyof SelectOptionT) => {
      if (isEmpty(selectState.displayedOptions)) {
        return;
      }
      const selectStateSetters = getSelectStateSetters();
      console.log(optionId, optionCategory);
      const nextElement = getFocusValues("down", optionId, optionCategory);
      console.log(nextElement);
      if (!isEmpty(nextElement)) {
        return selectStateSetters.setFocusDetails(
          nextElement.focusedOptionId,
          nextElement.focusedCategory
        );
      }
      const previousElement = getFocusValues("up", optionId, optionCategory);
      if (!isEmpty(previousElement)) {
        selectStateSetters.setFocusDetails(
          previousElement!.focusedOptionId,
          previousElement!.focusedCategory
        );
      }
    },
    [selectState.displayedOptions]
  );

  const addOptionOnKeyPress = useCallback(() => {
    const selectStateSetters = getSelectStateSetters();
    const selectOption = find(
      selectState.selectOptions,
      (option) => option.id === selectState.focusedOptionId
    );
    if (selectOption) {
      selectStateSetters.addValue(selectOption);
      focusOptionAfterClick(
        selectState.focusedOptionId,
        selectState.focusedCategory
      );
    }
  }, [
    selectState.selectOptions,
    selectState.focusedOptionId,
    selectState.focusedCategory,
  ]);

  const filterSearchedOptions = useCallback(() => {
    const selectStateSetters = getSelectStateSetters();
    const filteredOptions = filterOptionListBySearchValue(
      selectState.originalOptions,
      selectProps.labelKey,
      selectState.inputValue
    );
    selectStateSetters.setOptions(filteredOptions);
  }, [selectState.selectOptions, selectState.inputValue]);

  const focusFirstOption = useCallback(() => {
    if (isEmpty(selectState.displayedOptions)) return;
    const selectStateSetters = getSelectStateSetters();
    if (hasCategories) {
      const focusDetails = getFirstOptionAndCategory(
        selectState.displayedOptions as CategorizedSelectOptions
      );
      !isEmpty(focusDetails) &&
        selectStateSetters.setFocusDetails(
          focusDetails.focusedOptionId,
          focusDetails.focusedCategory
        );

      return focusDetails?.focusedOptionId;
    }
    const firstOption = (selectState.displayedOptions as SelectOptionList)[0];
    selectStateSetters.setFocusDetails(firstOption.id);
    return firstOption.id;
  }, [selectState.displayedOptions]);

  return {
    getSelectStateSetters,
    filterSearchedOptions,
    focusFirstOption,
    focusLastOption,
    getFocusValues,
    handlePageChange,
    focusOptionAfterClick,
    hasMoreData,
    addOptionOnKeyPress,
  };
};

export default useSelect;
