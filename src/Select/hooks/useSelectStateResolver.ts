import { concat, filter, isEmpty, isFunction, values } from "lodash";
import { useCallback } from "react";
import {
  SelectOptionList,
  SelectOptionT,
} from "src/Select/types/selectGeneralTypes";
import {
  SelectState,
  StateSetter,
  SelectStateUpdaters,
} from "src/Select/types/selectStateTypes";
import {
  SelectReducerActionTypes,
  SelectReducerDispatch,
} from "src/Select/stores/reducers/selectReducer";
import { resolveStateSetters, resolveStateValue } from "src/utils/select";

type StateCustomSetters = {
  setValue: StateSetter<SelectOptionList>;
  setInputValue: StateSetter<string> | undefined;
  setOptions: StateSetter<SelectOptionList> | undefined;
  setIsOpen: StateSetter<boolean> | undefined;
};

type ResolvedStateData = {
  selectState: SelectState;
  selectStateUpdaters: SelectStateUpdaters;
};

const useSelectStateResolver = (
  selectState: SelectState,
  customState: Partial<SelectState>,
  customStateSetters: StateCustomSetters,
  isMultiValue: boolean,
  dispatch: SelectReducerDispatch
): ResolvedStateData => {
  const {
    inputValue: defaultInputState,
    selectOptions: defaultOptionState,
    isOpen: defaultIsOpen,
    value,
  } = selectState;

  const {
    inputValue: customInputState,
    selectOptions: customOptionState,
    isOpen: customIsOpen,
  } = customState;

  // #STATE RESOLVERS
  const inputValue = resolveStateValue(defaultInputState, customInputState);
  const selectOptions = resolveStateValue(
    defaultOptionState,
    customOptionState
  );
  const isOpen = resolveStateValue(defaultIsOpen, customIsOpen);

  // #STATE UPDATE RESOLVERS
  const {
    setIsOpen,
    setInputValue: customInputValueSetter,
    setOptions: customOptionsSetter,
    setValue,
  } = customStateSetters;

  // #isOpen Resolvers
  const openDropdown = useCallback(
    () =>
      isFunction(setIsOpen)
        ? setIsOpen(true)
        : dispatch({ type: SelectReducerActionTypes.OPEN }),
    []
  );

  const closeDropdown = useCallback(
    () =>
      isFunction(setIsOpen)
        ? setIsOpen(false)
        : dispatch({ type: SelectReducerActionTypes.CLOSE }),
    []
  );

  const defaultToggleDropdown = useCallback(
    () => dispatch({ type: SelectReducerActionTypes.TOGGLE_VISIBILTY }),
    []
  );

  const customToggleDropdown = useCallback(() => setIsOpen!(isOpen), [isOpen]);

  const toggleDropdownVisibility = resolveStateSetters(
    defaultToggleDropdown,
    customToggleDropdown
  );

  // #inputValue Resolvers

  const clearInput = useCallback(
    () =>
      isFunction(customInputValueSetter)
        ? customInputValueSetter("")
        : dispatch({ type: SelectReducerActionTypes.CLEAR_INPUT }),
    []
  );

  const setInputValue = useCallback(
    (inputValue: string) =>
      isFunction(customInputValueSetter)
        ? customInputValueSetter(inputValue)
        : dispatch({
            type: SelectReducerActionTypes.SET_INPUT,
            payload: inputValue,
          }),
    []
  );

  // #selectOption Resolvers

  const setSelectOptions = useCallback(
    (options: SelectOptionList) =>
      isFunction(customOptionsSetter)
        ? customOptionsSetter(options)
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
      customOptionsSetter!(updatedSelectedOptions);
    },
    []
  );

  const addOptions = resolveStateSetters<SelectOptionList>(
    defaultAddSelectOptions,
    customAddSelectOptions
  );

  // #value Resolves

  const selectValue = useCallback(
    (option: SelectOptionT) => {
      const updatedValue = isMultiValue ? [...value, option] : [option];
      setValue(updatedValue);
    },
    [value]
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
