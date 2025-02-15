import { isEmpty } from "lodash";
import { Dispatch } from "react";
import {
  SelectState,
  SelectOptionList,
  SelectOptionT,
} from "src/components/Select/types/selectTypes";

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
  GO_TO_NEXT_PAGE = "GO_TO_NEXT_PAGE",
  RESET_PAGE = "RESET_PAGE",
}

export type SelectVisibiltyActions = {
  type:
    | SelectReducerActionTypes.OPEN
    | SelectReducerActionTypes.CLOSE
    | SelectReducerActionTypes.TOGGLE_VISIBILTY;
};

export type SelectValueActions =
  | {
      type: SelectReducerActionTypes.SET_VALUE;
      payload: { option: SelectOptionT; isMultiValue: boolean };
    }
  | { type: SelectReducerActionTypes.CLEAR_VALUE };

export type SelectInputActions =
  | { type: SelectReducerActionTypes.SET_INPUT; payload: string }
  | { type: SelectReducerActionTypes.CLEAR_INPUT };

export type SelectOptionSetterAction = {
  type: SelectReducerActionTypes.SET_OPTIONS;
  payload: SelectOptionList;
};

export type AddSelectOptionsListAction = {
  type: SelectReducerActionTypes.ADD_OPTION_LISTS;
  payload: SelectOptionList;
};

export type SetFocusedOptionActions = {
  type: SelectReducerActionTypes.SET_FOCUSED_OPTION;
  payload: {
    focusedOptionId: string;
    focusedCategory?: keyof SelectOptionT;
  };
};

export type SelectPageActions = {
  type:
    | SelectReducerActionTypes.GO_TO_NEXT_PAGE
    | SelectReducerActionTypes.RESET_PAGE;
};

type SelectActions =
  | SelectVisibiltyActions
  | SelectInputActions
  | SelectValueActions
  | SelectOptionSetterAction
  | SelectPageActions
  | SetFocusedOptionActions
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
        ? { ...state, inputValue: action.payload, isOpen: true }
        : state;
    case SelectReducerActionTypes.CLEAR_INPUT:
      return { ...state, inputValue: "" };
    case SelectReducerActionTypes.CLEAR_VALUE:
      return { ...state, value: [] };
    case SelectReducerActionTypes.SET_OPTIONS:
      return isEmpty(state.selectOptions) && isEmpty(action.payload)
        ? state
        : { ...state, selectOptions: action.payload };
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

    case SelectReducerActionTypes.SET_FOCUSED_OPTION: {
      const { focusedOptionId, focusedCategory } = action.payload;
      if (state.focusedOptionId == focusedOptionId) {
        return state;
      }
      return {
        ...state,
        focusedOptionId: focusedOptionId,
        focusedCategory: focusedCategory,
      };
    }

    default:
      return state;
  }
};
