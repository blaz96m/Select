import { clear, time } from "console";
import { sign } from "crypto";
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
  trim,
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
  INITIAL_STATE,
  REQUEST_CONFIG_DEFAULT_VALUES,
} from "src/general/utils/queryManager/constants";
import {
  queryManagerReducer,
  QueryManagerReducerActionTypes,
  QueryManagerState,
  QueryManagerActions,
} from "src/general/stores/queryManagerReducer";
import { resolveStateValue } from "src/general/utils/general";
import {
  resolveAndGetRequestParams,
  setConfig,
} from "src/general/utils/queryManager/helpers";
import { setPage } from "src/Store";
import { resolveStateSetters } from "src/Select/utils";

type CustomStateSetters = {
  setSearchQuery: Dispatch<SetStateAction<string>> | ((value: string) => void);
  setSort: Dispatch<SetStateAction<string>> | ((value: string) => void);
  setPage: Dispatch<SetStateAction<number>> | ((value: number) => void);
};

export type Response<T> = {
  data: T[];
  totalRecords?: number;
  [key: string]: any;
};

export type ResponseDetails<T> = Response<T> & {
  params?: Partial<RequestParams>;
};

export type RequestParams = {
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

export type RequestConfig = {
  isDisabled: boolean;
  defaultSort: string;
  fetchOnInit: boolean;
  recordsPerPage: number;
  fetchOnInputChange: boolean;
  inputFetchDeboubceDuration: number;
  preventFetchOnInputChange?: (searchQuery: string) => boolean;
};

const useQueryManager = <ResponseItemT>(
  fetchFunction?: (
    params: RequestParams,
    signal?: AbortSignal,
    ...args: any
  ) => Promise<Response<ResponseItemT>> | Promise<void>,
  onAfterFetch?: (responseDetails: ResponseDetails<ResponseItemT>) => void,
  customState?: Partial<CustomStateSetters> & Partial<QueryManagerState>,
  isLoading?: boolean,
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
    requestConfigRef.current = setConfig<ResponseItemT>(config);
  }

  const getRequestConfig = () => requestConfigRef.current as RequestConfig;
  const getTotalRecords = useCallback(() => totalRecordsRef.current, []);
  const isInitialFetch = useCallback(() => isInitialFetchRef.current, []);

  const searchQuery = resolveStateValue(
    state.searchQuery,
    customState?.searchQuery
  );
  const page = resolveStateValue(state.page, customState?.page);

  const sort = resolveStateValue(state.sort, customState?.sort);

  const fetch = useCallback(
    async (
      params?: Partial<RequestParams>,
      signal?: AbortSignal,
      ...args: any
    ): Promise<Response<ResponseItemT> | void> => {
      const requestConfig = getRequestConfig();

      if (requestConfig.isDisabled) return;

      if (!isFunction(fetchFunction)) {
        throw new Error("Fetch function not provided!");
      }

      const requestParams = resolveAndGetRequestParams(
        params,
        { searchQuery, page, sort },
        requestConfig
      );
      const response = await fetchFunction(requestParams, signal, ...args);
      if (isInitialFetch()) {
        endInitialFetch();
      }
      if (!isEmpty(response)) {
        totalRecordsRef.current = response!.totalRecords || 0;
        isFunction(onAfterFetch) &&
          onAfterFetch({
            ...response!,
            params: requestParams,
          });
        return response;
      }
    },
    [fetchFunction, searchQuery, page, state.sort]
  );

  const isLastPage = useCallback(() => {
    const totalRecords = totalRecordsRef.current;
    const { recordsPerPage } = getRequestConfig();
    if (isNumber(totalRecords) && recordsPerPage) {
      return page * recordsPerPage >= totalRecords;
    }
    return false;
  }, [page]);

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
    const customSetter = customState?.setPage;
    isFunction(customSetter)
      ? customSetter(1)
      : dispatch({ type: QueryManagerReducerActionTypes.RESET_PAGE });
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
    dispatch({
      type: QueryManagerReducerActionTypes.SET_SORTING,
      payload: sortProperty,
    });
  }, []);

  const clearSorting = useCallback(() => {
    dispatch({
      type: QueryManagerReducerActionTypes.RESET_SORTING,
    });
  }, []);

  const endInitialFetch = () => {
    isInitialFetchRef.current = false;
  };

  useEffect(() => {
    debugger;
    const abortController = new AbortController();
    const signal = abortController.signal;
    const requestConfig = getRequestConfig();
    const { isDisabled, fetchOnInit } = requestConfig;

    const pageChangeTriggeredByInput =
      searchQuery !== previousSearchQueryValueRef.current;

    const preventFetchOnPageChange =
      isDisabled ||
      pageChangeTriggeredByInput ||
      (isInitialFetch() && !fetchOnInit) ||
      isLoading;

    if (!preventFetchOnPageChange) {
      fetch({}, signal);
    } else if (pageChangeTriggeredByInput) {
      previousSearchQueryValueRef.current = searchQuery;
    }
    return () => abortController.abort();
  }, [page]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const {
      isDisabled,
      fetchOnInputChange,
      preventFetchOnInputChange,
      inputFetchDeboubceDuration,
    } = getRequestConfig();

    let timeoutId: NodeJS.Timeout | undefined;

    const previousSearchQueryValue = previousSearchQueryValueRef.current;

    const shouldPreventInputChange =
      isFunction(preventFetchOnInputChange) &&
      preventFetchOnInputChange(searchQuery);
    const inputChanged = previousSearchQueryValue !== searchQuery;

    const preventFetchOnChange =
      isDisabled ||
      !fetchOnInputChange ||
      isInitialFetch() ||
      !inputChanged ||
      shouldPreventInputChange ||
      isLoading;

    if (!preventFetchOnChange) {
      // If the search query had a value before and is empty currently, dont debounce
      const fetchImmediately = !searchQuery && previousSearchQueryValue;

      if (fetchImmediately) {
        if (page === 1) {
          previousSearchQueryValueRef.current = searchQuery;
        } else {
          resetPage();
        }
        fetch({ page: 1 }, signal);
      } else {
        timeoutId = setTimeout(async () => {
          if (page === 1) {
            previousSearchQueryValueRef.current = searchQuery;
          } else {
            resetPage();
          }
          fetch({ page: 1 }, signal);
        }, inputFetchDeboubceDuration);
      }
    }
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      abortController.abort();
    };

    return cleanup;
  }, [searchQuery]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const { isDisabled } = getRequestConfig();

    if (!isDisabled && !isInitialFetch()) {
      fetch({}, signal);
    }

    return () => abortController.abort();
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
