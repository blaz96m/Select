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
  SelectFetchFunction,
} from "src/components/Select/types";
import { filter, isEmpty, isFunction, slice } from "lodash";
import {
  filterOptionListBySearchValue,
  filterSelectedValues,
} from "src/utils/select";

export type SelectApi = {
  closeDropdown: () => void;
  openDropdown: () => void;
  toggleDropdown: () => void;
  setInputValue: (value: string) => void;
  clearInput: () => void;
  setOptions: (options: SelectOptionList) => void;
  addOptions: (options: SelectOptionList) => void;
  handleValueChange: (option: SelectOptionT, isMultiValue: boolean) => void;
  clearValue: (optionId: string) => void;
  clearAllValues: () => void;
  loadNextPage: () => void;
};

type StateSetter<T> = Dispatch<SetStateAction<T>>;

type CustomSelectStateSetters = {
  setValue: StateSetter<SelectOptionList>;
  setOptions?: StateSetter<SelectOptionList>;
};

const useSelect = (
  dispatch: SelectReducerDispatch,
  customStateUpdaters: CustomSelectStateSetters,
  selectState: SelectState,
  selectProps: {
    isMultiValue: boolean;
    labelKey: keyof SelectOptionT;
  },
  originalOptions: SelectOptionList
) => {
  const { setValue } = customStateUpdaters;
  const onHandleValueChange = useCallback(
    (option: SelectOptionT, isMultiValue: boolean) => {
      setValue((prevState) =>
        isMultiValue ? [...prevState, option] : [option]
      );
    },
    [selectState.value]
  );
  const onClearValue = useCallback(
    (optionId: keyof SelectOptionT) => {
      setValue((prevState) =>
        filter(prevState, (option) => option.id !== optionId)
      );
    },
    [selectState.value]
  );
  const onClearAllValues = useCallback(() => {
    setValue((prevState) => (isEmpty(prevState) ? prevState : []));
  }, [selectState.value]);

  const buildSelectApi = (dispatch: SelectReducerDispatch): SelectApi => ({
    openDropdown: () => dispatch({ type: SelectReducerActionTypes.OPEN }),
    closeDropdown: () => dispatch({ type: SelectReducerActionTypes.CLOSE }),
    toggleDropdown: () =>
      dispatch({ type: SelectReducerActionTypes.TOGGLE_VISIBILTY }),
    setInputValue: (value) =>
      dispatch({ type: SelectReducerActionTypes.SET_INPUT, payload: value }),
    clearInput: () => dispatch({ type: SelectReducerActionTypes.CLEAR_INPUT }),
    handleValueChange: (option, isMultiValue) =>
      onHandleValueChange(option, isMultiValue),
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
  });

  const selectApi = useMemo(() => buildSelectApi(dispatch), []);

  return selectApi;
};

export default useSelect;
