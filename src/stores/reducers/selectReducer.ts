import { Dispatch, SetStateAction, act } from "react";
import {
  SelectState,
  SelectOptionList,
  SelectOptionT,
} from "src/components/Select/types/selectTypes";
import {
  concatObjects,
  getObjectKeys,
} from "src/utils/data-types/objects/helpers";

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
  SET_FOCUSED_OPTION_LIST = "SET_FOCUSED_OPTION_LIST",
  SET_FOCUSED_OPTION_CATEGORY = "SET_FOCUSED_OPTION_CATEGORY",
  FOCUS_FIRST_OPTION_LIST = "FOCUS_FIRST_OPTION_LIST",
  FOCUS_LAST_OPTION_LIST = "FOCUS_LAST_OPTION_LIST",
  GO_TO_NEXT_PAGE = "GO_TO_NEXT_PAGE",
}

export type SelectVisibiltyActions = {
  type:
    | SelectReducerActionTypes.OPEN
    | SelectReducerActionTypes.CLOSE
    | SelectReducerActionTypes.TOGGLE_VISIBILTY;
};

export type SelectPageAction = {
  type: SelectReducerActionTypes.GO_TO_NEXT_PAGE;
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
  paylod: SelectOptionList;
};

export type AddSelectOptionsListAction = {
  type: SelectReducerActionTypes.ADD_OPTION_LISTS;
  payload: SelectOptionList;
};

export type SetFocusedListOptionActions = {
  type: SelectReducerActionTypes.SET_FOCUSED_OPTION_LIST;
  payload: string;
};

export type SetFocusedCategoryOptionActions = {
  type: SelectReducerActionTypes.SET_FOCUSED_OPTION_CATEGORY;
  payload: {
    focusedCategory: string;
    focusedOptionId: string;
  };
};

export type SelectPageActions = {
  type: SelectReducerActionTypes.GO_TO_NEXT_PAGE;
};

type SelectActions =
  | SelectVisibiltyActions
  | SelectInputActions
  | SelectValueActions
  | SelectOptionSetterAction
  | SelectPageActions
  | SetFocusedListOptionActions
  | SetFocusedCategoryOptionActions
  | AddSelectOptionsListAction
  | SelectPageAction;

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
      return { ...state, inputValue: action.payload };
    case SelectReducerActionTypes.CLEAR_INPUT:
      return { ...state, inputValue: "" };
    case SelectReducerActionTypes.SET_VALUE:
      const isMultiValue = action.payload.isMultiValue;
      const option = action.payload.option;
      return {
        ...state,
        value: isMultiValue ? [...state.value, option] : [option],
      };
    case SelectReducerActionTypes.CLEAR_VALUE:
      return { ...state, value: [] };
    case SelectReducerActionTypes.SET_OPTIONS:
      return { ...state, selectOptions: action.paylod };
    case SelectReducerActionTypes.GO_TO_NEXT_PAGE:
      return { ...state, page: ++state.page };

    case SelectReducerActionTypes.ADD_OPTION_LISTS:
      return {
        ...state,
        selectOptions: [
          ...(state.selectOptions as SelectOptionList),
          ...action.payload,
        ],
      };

    case SelectReducerActionTypes.SET_FOCUSED_OPTION_LIST: {
      return { ...state, focusedOptionId: action.payload };
    }

    case SelectReducerActionTypes.SET_FOCUSED_OPTION_CATEGORY:
      return {
        ...state,
        focusedCategory: action.payload.focusedCategory,
        focusedOptionId: action.payload.focusedOptionId,
      };

    default:
      return state;
  }
};
