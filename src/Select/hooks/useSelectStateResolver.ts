import { concat, filter, isFunction, update } from "lodash";
import { useCallback } from "react";
import {
  SelectOptionList,
  SelectOptionT,
} from "src/Select/types/selectGeneralTypes";
import {
  SelectState,
  CustomState,
  CustomStateSetters,
  SelectStateUpdaters,
} from "src/Select/types/selectStateTypes";
import {
  SelectReducerActionTypes,
  SelectReducerDispatch,
} from "src/Select/stores/selectReducer";
import { resolveStateSetters } from "src/Select/utils";
import { resolveStateValue } from "src/general/utils/general";

type ResolvedStateData = {
  selectState: SelectState;
  selectStateUpdaters: SelectStateUpdaters;
};

const useSelectStateResolver = (
  selectState: SelectState,
  customState: CustomState,
  customStateSetters: CustomStateSetters,
  isMultiValue: boolean,
  dispatch: SelectReducerDispatch
): ResolvedStateData => {
  const {
    inputValue: defaultInputState,
    selectOptions: defaultOptionState,
    isOpen: defaultIsOpen,
    page: defaultPage,
    value,
  } = selectState;

  const { customInputValue, customSelectOptions, customIsOpen, customPage } =
    customState;

  // #STATE RESOLVERS
  const inputValue = resolveStateValue(defaultInputState, customInputValue);
  const selectOptions = resolveStateValue(
    defaultOptionState,
    customSelectOptions
  );
  const isOpen = resolveStateValue(defaultIsOpen, customIsOpen);
  const page = resolveStateValue(defaultPage, customPage);

  // #STATE UPDATER RESOLVERS
  const {
    customSetIsOpen,
    customSetInputValue,
    customSetSelectOptions,
    setValue,
    customSetPage,
  } = customStateSetters;

  // #isOpen Resolvers

  const openDropdown = useCallback(() => {
    isFunction(customSetIsOpen)
      ? customSetIsOpen(true)
      : dispatch({ type: SelectReducerActionTypes.OPEN });
  }, []);

  const closeDropdown = useCallback(
    () =>
      isFunction(customSetIsOpen)
        ? customSetIsOpen(false)
        : dispatch({ type: SelectReducerActionTypes.CLOSE }),
    []
  );

  const defaultToggleDropdown = useCallback(
    () => dispatch({ type: SelectReducerActionTypes.TOGGLE_VISIBILTY }),
    []
  );

  const customToggleDropdown = useCallback(
    () => customSetIsOpen!(!isOpen),
    [isOpen]
  );

  const toggleDropdownVisibility = resolveStateSetters(
    defaultToggleDropdown,
    customSetIsOpen,
    customToggleDropdown
  ) as () => void;

  // #inputValue Resolvers

  const clearInput = useCallback(
    () =>
      isFunction(customSetInputValue)
        ? customSetInputValue("")
        : dispatch({ type: SelectReducerActionTypes.CLEAR_INPUT }),
    []
  );

  const setInputValue = useCallback(
    (inputValue: string) =>
      isFunction(customSetInputValue)
        ? customSetInputValue(inputValue)
        : dispatch({
            type: SelectReducerActionTypes.SET_INPUT,
            payload: inputValue,
          }),
    []
  );

  // #selectOption Resolvers

  const setSelectOptions = useCallback(
    (options: SelectOptionList) =>
      isFunction(customSetSelectOptions)
        ? customSetSelectOptions(options)
        : dispatch({
            type: SelectReducerActionTypes.SET_OPTIONS,
            payload: options,
          }),
    []
  );

  const defaultAddSelectOptions = useCallback(
    (options: SelectOptionList) =>
      dispatch({
        type: SelectReducerActionTypes.ADD_OPTION_LISTS,
        payload: options,
      }),
    []
  );

  const customAddSelectOptions = useCallback(
    (optionsToAdd: SelectOptionList) => {
      const updatedSelectedOptions = concat(selectOptions, optionsToAdd);
      customSetSelectOptions!(updatedSelectedOptions);
    },
    [selectOptions]
  );

  const addOptions = resolveStateSetters<SelectOptionList>(
    defaultAddSelectOptions,
    customSetSelectOptions,
    customAddSelectOptions
  );

  // #value Resolves

  const selectValue = useCallback(
    (option: SelectOptionT) => {
      const updatedValue = isMultiValue ? [...value, option] : [option];
      setValue(updatedValue);
    },
    [value, isMultiValue]
  );

  const clearValue = useCallback(
    (clearedOptionId: keyof SelectOptionT) => {
      const updatedValue = filter(
        value,
        (val: SelectOptionT) => val.id != clearedOptionId
      );
      setValue(updatedValue);
    },
    [value]
  );

  const clearAllValues = useCallback(() => setValue([]), []);

  // #page Resolvers

  const loadNextPage = useCallback(
    () =>
      isFunction(customSetPage)
        ? customSetPage(page + 1)
        : dispatch({ type: SelectReducerActionTypes.GO_TO_NEXT_PAGE }),
    [page]
  );

  const resetPage = useCallback(
    () =>
      isFunction(customSetPage)
        ? customSetPage(1)
        : dispatch({ type: SelectReducerActionTypes.RESET_PAGE }),
    []
  );

  const setPage = useCallback(
    (page: number) =>
      dispatch({ type: SelectReducerActionTypes.SET_PAGE, payload: page }),

    []
  );

  return {
    selectState: { ...selectState, isOpen, selectOptions, inputValue, page },
    selectStateUpdaters: {
      clearAllValues,
      selectValue,
      setValue,
      setInputValue,
      toggleDropdownVisibility,
      clearValue,
      clearInput,
      addOptions,
      openDropdown,
      closeDropdown,
      setSelectOptions,
      resetPage,
      setPage,
      loadNextPage,
    },
  };
};

export default useSelectStateResolver;
