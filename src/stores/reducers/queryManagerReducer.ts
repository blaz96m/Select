export enum QueryManagerReducerActionTypes {
  SET_SEARCH_QUERY = "SET_SEARCH_QUERY",
  CLEAR_SEARCH_QUERY = "CLEAR_SEARCH_QUERY",
  GO_TO_PAGE = "GO_TO_PAGE",
  GO_TO_NEXT_PAGE = "GO_TO_NEXT_PAGE",
  RESET_PAGE = "RESET_PAGE",
  SET_SORTING = "SET_SORTING",
  RESET_SORTING = "RESET_SORTING",
}

export type QueryManagerState = {
  page: number;
  sort: string;
  searchQuery: string;
};

export type InputActions =
  | {
      type: QueryManagerReducerActionTypes.CLEAR_SEARCH_QUERY;
    }
  | { type: QueryManagerReducerActionTypes.SET_SEARCH_QUERY; payload: string };

export type PageActions =
  | {
      type:
        | QueryManagerReducerActionTypes.GO_TO_NEXT_PAGE
        | QueryManagerReducerActionTypes.RESET_PAGE;
    }
  | { type: QueryManagerReducerActionTypes.GO_TO_PAGE; payload: number };

export type SortingActions =
  | {
      type: QueryManagerReducerActionTypes.SET_SORTING;
      payload: string;
    }
  | { type: QueryManagerReducerActionTypes.RESET_SORTING };

type QueryManagerActions = InputActions | PageActions | SortingActions;

export const queryManagerReducer = (
  state: QueryManagerState,
  action: QueryManagerActions
): QueryManagerState => {
  const { type } = action;
  switch (type) {
    case QueryManagerReducerActionTypes.CLEAR_SEARCH_QUERY:
      return { ...state, searchQuery: "", page: 1 };
    case QueryManagerReducerActionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload, page: 1 };
    case QueryManagerReducerActionTypes.GO_TO_NEXT_PAGE:
      return { ...state, page: state.page + 1 };
    case QueryManagerReducerActionTypes.GO_TO_PAGE:
      return { ...state, page: action.payload };
    case QueryManagerReducerActionTypes.RESET_PAGE:
      return { ...state, page: 1 };
    case QueryManagerReducerActionTypes.SET_SORTING:
      return { ...state, sort: action.payload };
    case QueryManagerReducerActionTypes.RESET_SORTING:
      return { ...state, sort: "" };
    default:
      return state;
  }
};
