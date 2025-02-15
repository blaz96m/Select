import { stat } from "fs";
import {
  isEmpty,
  isFunction,
  isNumber,
  partial,
  merge,
  isNil,
  defaults,
  noop,
} from "lodash";
import {
  useCallback,
  useReducer,
  useRef,
  useEffect,
  MutableRefObject,
  Dispatch,
  SetStateAction,
} from "react";
import {
  queryManagerReducer,
  QueryManagerReducerActionTypes,
  QueryManagerState,
  QueryManagerActions,
} from "src/stores/reducers/queryManagerReducer";

const INITIAL_STATE = {
  page: 1,
  sort: "",
  searchQuery: "",
};

const REQUEST_CONFIG_DEFAULT_VALUES: RequestConfig = {
  isDisabled: false,
  fetchOnInit: true,
  defaultSort: "",
  recordsPerPage: 15,
  fetchOnInputChange: false,
};

type CustomStateSetters = {
  setSearchQuery: Dispatch<SetStateAction<string>> | ((value: string) => void);
  setSort: Dispatch<SetStateAction<string>> | ((value: string) => void);
  setPage: Dispatch<SetStateAction<number>> | ((value: number) => void);
};

const resolveStateValue = <T>(
  defaultStateValue: T,
  customStateValue: T | undefined | null
): T => (!isNil(customStateValue) ? customStateValue : defaultStateValue);

const resolveStateSetter = <T>(
  defaultStateSetter: ((arg: T) => void) | Dispatch<SetStateAction<T>>,
  customStateSetter:
    | ((arg: T) => void)
    | Dispatch<SetStateAction<T>>
    | undefined
): ((arg: T) => void) | Dispatch<SetStateAction<T>> =>
  isFunction(customStateSetter) ? customStateSetter : defaultStateSetter;

const resolveStateValuesAndSetters = (
  defaultState: QueryManagerState,
  dispatch: Dispatch<QueryManagerActions>,
  customState?: Partial<QueryManagerState> & Partial<CustomStateSetters>
) => {
  const searchQuery = resolveStateValue(
    defaultState.searchQuery,
    customState?.searchQuery
  );
  const setSearchQueryDispatch = (inputVal: string) =>
    dispatch({
      type: QueryManagerReducerActionTypes.SET_SEARCH_QUERY,
      payload: inputVal,
    });

  const handleSearchQueryUpdate = resolveStateSetter(
    setSearchQueryDispatch,
    customState?.setSearchQuery
  );

  const clearSearchQueryDispatch = () =>
    dispatch({ type: QueryManagerReducerActionTypes.CLEAR_SEARCH_QUERY });

  return {
    searchQuery,
  };
};

const setConfig = <T>(
  propValues?: Partial<RequestConfig>,
  fetchFunction?: (...args: any) => Promise<Response<T> | void>
) => {
  const config = REQUEST_CONFIG_DEFAULT_VALUES;
  if (!isFunction(fetchFunction) || !propValues) {
    config.isDisabled = true;
    return config;
  }
  return merge(config, propValues);
};

export type Response<T> = {
  data: T[];
  totalRecords?: number;
  [key: string]: any;
};

export type ResponseDetails<T> = Response<T> & {
  params?: Partial<RequestParams>;
};

type RequestParams = {
  page?: number;
  searchQuery?: string;
  sort?: string;
  recordsPerPage?: number;
  [key: string]: any;
};

type QueryManagerApi<ResponseItemT> = {
  clearSorting: () => void;
  setSorting: (sortBy: string) => void;
  clearSearchQuery: () => void;
  setSearchQuery:
    | Dispatch<SetStateAction<string>>
    | ((inputValue: string) => void);
  resetPage: () => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  getTotalRecords: () => number;
  isInitialFetch: () => boolean;
  isLastPage: () => boolean;
  fetch: QueryManagerFetchFunc<ResponseItemT>;
  endInitialFetch: () => void;
};

type QueryManagerFetchFunc<ResponseItemT> = (
  params?: Partial<RequestParams>,
  ...args: any
) => Promise<Response<ResponseItemT> | void>;

type RequestConfig = {
  isDisabled: boolean;
  defaultSort: string;
  fetchOnInit: boolean;
  recordsPerPage: number;
  fetchOnInputChange: boolean;
  preventFetchOnInputChange?: (searchQuery: string) => boolean;
};

const useQueryManager = <ResponseItemT>(
  fetchFunction?: (
    params: RequestParams,
    ...args: any
  ) => Promise<Response<ResponseItemT>> | Promise<void>,
  onAfterFetch?: (responseDetails: ResponseDetails<ResponseItemT>) => void,
  customState?: Partial<CustomStateSetters> & Partial<QueryManagerState>,
  config?: Partial<RequestConfig>
): {
  queryManagerState: QueryManagerState;
  queryManagerApi: QueryManagerApi<ResponseItemT>;
} => {
  const [state, dispatch] = useReducer(queryManagerReducer, INITIAL_STATE);
  const requestConfigRef = useRef<RequestConfig | null>(null);
  const previousSearchQueryValueRef = useRef("");
  const isInitialFetchRef = useRef(true);
  const totalRecordsRef = useRef(0);

  if (requestConfigRef.current == null) {
    requestConfigRef.current = setConfig<ResponseItemT>(config, fetchFunction);
  }

  const getRequestConfig = () => requestConfigRef.current as RequestConfig;
  const getTotalRecords = useCallback(() => totalRecordsRef.current, []);
  const isInitialFetch = useCallback(() => isInitialFetchRef.current, []);

  const { searchQuery } = resolveStateValuesAndSetters(
    state,
    dispatch,
    customState
  );

  const fetch = useCallback(
    async (
      params?: Partial<RequestParams>,
      ...args: any
    ): Promise<Response<ResponseItemT> | void> => {
      if (!isFunction(fetchFunction)) return { data: [] };
      const requestConfig = getRequestConfig();
      const requestParams = {
        searchQuery: (params && params.searchQuery) || searchQuery,
        sort:
          (params && params.sort) || requestConfig.defaultSort || state.sort,
        page: (params && params.page) || state.page,
        recordsPerPage: requestConfig.recordsPerPage,
        ...params,
      };
      const response = await fetchFunction(requestParams, ...args);
      if (response) {
        totalRecordsRef.current = response.totalRecords || 0;
        isFunction(onAfterFetch) &&
          onAfterFetch({
            ...response,
            params: requestParams,
          });
        return response;
      }
    },
    [fetchFunction, searchQuery, state.page, state.sort]
  );
  // TODO MAKE RECORDS PER PAGE OR RATHER PAGE SIZE A PART OF STATE, ALSO RENAME
  const isLastPage = useCallback(() => {
    const totalRecords = totalRecordsRef.current;
    const { recordsPerPage } = getRequestConfig();
    if (isNumber(totalRecords) && recordsPerPage) {
      return state.page * recordsPerPage >= totalRecords;
    }
    return false;
  }, [state.page]);

  const goToNextPage = useCallback(
    () => dispatch({ type: QueryManagerReducerActionTypes.GO_TO_NEXT_PAGE }),
    []
  );

  const goToPreviousPage = useCallback(
    () =>
      dispatch({ type: QueryManagerReducerActionTypes.GO_TO_PREVIOUS_PAGE }),
    []
  );

  const goToPage = useCallback((page: number) => {
    const customSetter = customState?.setPage;
    isFunction(customSetter)
      ? customSetter(page)
      : dispatch({
          type: QueryManagerReducerActionTypes.GO_TO_PAGE,
          payload: page,
        });
  }, []);

  const resetPage = useCallback(() => {
    dispatch({ type: QueryManagerReducerActionTypes.RESET_PAGE });
  }, []);

  const setSearchQuery = useCallback(
    (searchValue: string) => {
      dispatch({
        type: QueryManagerReducerActionTypes.SET_SEARCH_QUERY,
        payload: searchValue,
      });
    },
    [state.searchQuery]
  );

  const clearSearchQuery = useCallback(
    () => dispatch({ type: QueryManagerReducerActionTypes.CLEAR_SEARCH_QUERY }),
    []
  );

  const setSorting = useCallback((sortProperty: string) => {
    const customSetter = customState?.setSort;
    isFunction(customSetter)
      ? customSetter(sortProperty)
      : dispatch({
          type: QueryManagerReducerActionTypes.SET_SORTING,
          payload: sortProperty,
        });
  }, []);

  const clearSorting = useCallback(() => {
    const customSetter = customState?.setSort;
    isFunction(customSetter)
      ? customSetter("")
      : dispatch({
          type: QueryManagerReducerActionTypes.RESET_SORTING,
        });
  }, []);

  const endInitialFetch = () => {
    isInitialFetchRef.current = false;
  };

  useEffect(() => {
    const requestConfig = getRequestConfig();
    const { isDisabled, fetchOnInit } = requestConfig;
    const pageChangeTriggeredByInput =
      searchQuery != previousSearchQueryValueRef.current;
    if (
      !(
        isDisabled ||
        pageChangeTriggeredByInput ||
        (isInitialFetchRef.current && !fetchOnInit)
      )
    ) {
      (async () => {
        await fetch();
      })();
    }
  }, [state.page]);

  useEffect(() => {
    const { isDisabled, fetchOnInputChange, preventFetchOnInputChange } =
      getRequestConfig();
    if (
      isDisabled ||
      !fetchOnInputChange ||
      isInitialFetchRef.current ||
      previousSearchQueryValueRef.current === searchQuery ||
      // TODO HANDLE BETTER
      (isFunction(preventFetchOnInputChange) &&
        preventFetchOnInputChange(searchQuery))
    ) {
      return noop;
    }
    let timeoutId: NodeJS.Timeout | undefined;
    if (!searchQuery && previousSearchQueryValueRef.current) {
      fetch({ page: 1 });
      previousSearchQueryValueRef.current = searchQuery;
    }
    if (searchQuery) {
      timeoutId = setTimeout(async () => {
        fetch({ page: 1 });
        previousSearchQueryValueRef.current = searchQuery;
      }, 700);
    }

    if (timeoutId) {
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  useEffect(() => {
    const { isDisabled } = getRequestConfig();
    if (isDisabled || isInitialFetchRef.current) return;
    (async () => {
      await fetch();
    })();
  }, [state.sort]);

  return {
    queryManagerState: state,
    queryManagerApi: {
      clearSearchQuery,
      clearSorting,
      goToNextPage,
      goToPage,
      goToPreviousPage,
      resetPage,
      setSearchQuery,
      setSorting,
      getTotalRecords,
      isLastPage,
      fetch,
      isInitialFetch,
      endInitialFetch,
    },
  };
};

export default useQueryManager;
