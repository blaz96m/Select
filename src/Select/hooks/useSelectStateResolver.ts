import { concat, filter, isEmpty, isFunction, values } from "lodash";
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
    value,
  } = selectState;

  const { customInputValue, customSelectOptions, customIsOpen } = customState;

  // #STATE RESOLVERS
  const inputValue = resolveStateValue(defaultInputState, customInputValue);
  const selectOptions = resolveStateValue(
    defaultOptionState,
    customSelectOptions
  );
  const isOpen = resolveStateValue(defaultIsOpen, customIsOpen);

  // #STATE UPDATER RESOLVERS
  const {
    customSetIsOpen,
    customSetInputValue,
    customSetSelectOptions,
    setValue,
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
      console.log("TO ADD ", optionsToAdd);
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
        (val: SelectOptionT) => val.id !== clearedOptionId
      );
      setValue(updatedValue);
    },
    [value]
  );

  const clearAllValues = useCallback(() => {
    if (!isEmpty(value)) {
      setValue([]);
    }
  }, [value]);

  // #page Resolvers

  const loadNextPage = useCallback(
    () => dispatch({ type: SelectReducerActionTypes.GO_TO_NEXT_PAGE }),
    []
  );

  const resetPage = useCallback(
    () => dispatch({ type: SelectReducerActionTypes.RESET_PAGE }),
    []
  );

  return {
    selectState: { ...selectState, isOpen, selectOptions, inputValue },
    selectStateUpdaters: {
      clearAllValues,
      selectValue,
      setInputValue,
      toggleDropdownVisibility,
      clearValue,
      clearInput,
      addOptions,
      openDropdown,
      closeDropdown,
      setSelectOptions,
      resetPage,
      loadNextPage,
    },
  };
};

export default useSelectStateResolver;
