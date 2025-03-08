import { isEmpty } from "lodash";
import { Dispatch } from "react";
import {
  SelectOptionList,
  SelectOptionT,
} from "src/Select/types/selectGeneralTypes";

import { SelectState } from "src/Select/types/selectStateTypes";

export enum SelectReducerActionTypes {
  OPEN = "OPEN",
  CLOSE = "CLOSE",
  TOGGLE_VISIBILTY = "TOGGLE_VISIBILTY",
  SET_INPUT = "SET_INPUT",
  CLEAR_INPUT = "CLEAR_INPUT",
  SET_VALUE = "SET_VALUE",
  CLEAR_VALUE = "CLEAR_VALUE",
  SET_OPTIONS = "SET_OPTIONS",
  ADD_OPTION_LISTS = "ADD_OPTION_LISTS",
  ADD_OPTION_CATEGORIES = "ADD_OPTION_CATEGORIES",
  SET_FOCUSED_OPTION = "SET_FOCUSED:OPTION",
  SET_PAGE = "SET_PAGE",
  GO_TO_NEXT_PAGE = "GO_TO_NEXT_PAGE",
  RESET_PAGE = "RESET_PAGE",
}

type SelectVisibiltyActions = {
  type:
    | SelectReducerActionTypes.OPEN
    | SelectReducerActionTypes.CLOSE
    | SelectReducerActionTypes.TOGGLE_VISIBILTY;
};

type SelectValueActions =
  | {
      type: SelectReducerActionTypes.SET_VALUE;
      payload: { option: SelectOptionT; isMultiValue: boolean };
    }
  | { type: SelectReducerActionTypes.CLEAR_VALUE };

type SelectInputActions =
  | { type: SelectReducerActionTypes.SET_INPUT; payload: string }
  | { type: SelectReducerActionTypes.CLEAR_INPUT };

type SelectOptionSetterAction = {
  type: SelectReducerActionTypes.SET_OPTIONS;
  payload: SelectOptionList;
};

type AddSelectOptionsListAction = {
  type: SelectReducerActionTypes.ADD_OPTION_LISTS;
  payload: SelectOptionList;
};

export type SelectPageActions =
  | { type: SelectReducerActionTypes.GO_TO_NEXT_PAGE }
  | { type: SelectReducerActionTypes.RESET_PAGE }
  | { type: SelectReducerActionTypes.SET_PAGE; payload: number };

type SelectActions =
  | SelectVisibiltyActions
  | SelectInputActions
  | SelectValueActions
  | SelectOptionSetterAction
  | SelectPageActions
  | AddSelectOptionsListAction;

export type SelectReducerDispatch = Dispatch<SelectActions>;

export const selectReducer = (
  state: SelectState,
  action: SelectActions
): SelectState => {
  const { type } = action;
  switch (type) {
    case SelectReducerActionTypes.OPEN:
      return { ...state, isOpen: true };
    case SelectReducerActionTypes.CLOSE:
      return { ...state, isOpen: false };
    case SelectReducerActionTypes.TOGGLE_VISIBILTY:
      return { ...state, isOpen: !state.isOpen };
    case SelectReducerActionTypes.SET_INPUT:
      return state.inputValue !== action.payload
        ? { ...state, inputValue: action.payload }
        : state;
    case SelectReducerActionTypes.CLEAR_INPUT:
      return { ...state, inputValue: "" };
    case SelectReducerActionTypes.CLEAR_VALUE:
      return { ...state, value: [] };
    case SelectReducerActionTypes.SET_OPTIONS:
      return isEmpty(state.selectOptions) && isEmpty(action.payload)
        ? state
        : { ...state, selectOptions: action.payload };

    case SelectReducerActionTypes.SET_PAGE:
      return { ...state, page: action.payload };

    case SelectReducerActionTypes.GO_TO_NEXT_PAGE:
      return { ...state, page: state.page + 1 };

    case SelectReducerActionTypes.RESET_PAGE:
      return { ...state, page: 1 };

    case SelectReducerActionTypes.ADD_OPTION_LISTS:
      return {
        ...state,
        selectOptions: [
          ...(state.selectOptions as SelectOptionList),
          ...action.payload,
        ],
      };

    default:
      return state;
  }
};
