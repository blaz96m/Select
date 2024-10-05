import React, {
  useContext,
  createContext,
  useReducer,
  useMemo,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import {
  SelectOptionT,
  SelectOptionList,
  SelectState,
} from "src/components/Select/types/selectTypes";
import {
  SelectReducerActionTypes,
  selectReducer,
} from "src/stores/reducers/selectReducer";
import { noop } from "lodash";

export type SelectProviderProps = {
  value: SelectOptionT[] | [];
  valueKey: keyof SelectOptionT;
  isCategorized?: boolean;
  selectOptions?: SelectOptionT[] | [];
  onChange: Dispatch<SetStateAction<SelectOptionT[]>>;
};

const initialState: SelectState = {
  isOpen: false,
  value: [],
  selectOptions: [],
  inputValue: "",
  page: 1,
  focusedCategory: "",
  focusedOptionId: "",
};

const initializeState = (initialValues: {
  value: SelectOptionList | [];
  selectOptions: SelectOptionList | [];
}): SelectState => ({
  ...initialState,
  value: initialValues.value,
  selectOptions: initialValues.selectOptions,
});

const SelectDataContext = createContext(initialState);
const SelectApiContext = createContext({
  openDropdown: () => {},
  closeDropdown: () => {},
  toggleDropdown: () => {},
  setInput: (value: string) => {},
  clearValues: () => {},
  setValue: (option: SelectOptionT, isMultiValue: boolean) => {},
  clearInput: () => {},
});

export const SelectProvider = ({
  value,
  valueKey,
  isCategorized,
  selectOptions = [],
  setValue,
  children,
}: SelectProviderProps & { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    selectReducer,
    { value, selectOptions },
    initializeState
  );

  const data = useMemo(
    () => ({
      isOpen: state.isOpen,
      value: state.value,
      selectOptions: state.selectOptions,
      inputValue: state.inputValue,
      page: state.page,
      focusedCategory: state.focusedCategory,
      focusedOptionId: state.focusedOptionId,
    }),
    [
      state.isOpen,
      state.value,
      state.selectOptions,
      state.inputValue,
      state.page,
      state.focusedCategory,
      state.focusedOptionId,
    ]
  );

  const api = useMemo(
    () => ({
      openDropdown: () => dispatch({ type: SelectReducerActionTypes.OPEN }),
      closeDropdown: () => dispatch({ type: SelectReducerActionTypes.CLOSE }),
      toggleDropdown: () =>
        dispatch({ type: SelectReducerActionTypes.TOGGLE_VISIBILTY }),
      setInput: (value: string) =>
        dispatch({ type: SelectReducerActionTypes.SET_INPUT, payload: value }),
      clearValues: () =>
        dispatch({ type: SelectReducerActionTypes.CLEAR_VALUE }),
      setValue: (option: SelectOptionT, isMultiValue: boolean) =>
        dispatch({
          type: SelectReducerActionTypes.SET_VALUE,
          payload: { isMultiValue, option },
        }),
      clearInput: () =>
        dispatch({ type: SelectReducerActionTypes.CLEAR_INPUT }),
    }),
    []
  );

  return (
    <SelectDataContext.Provider value={data}>
      <SelectApiContext.Provider value={api}>
        {children}
      </SelectApiContext.Provider>
    </SelectDataContext.Provider>
  );
};

export const useSelectData = () => useContext(SelectDataContext);
export const useSelectApi = () => useContext(SelectApiContext);
