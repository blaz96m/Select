import { stat } from "fs";
import { isEmpty, isFunction, isNumber, partial, merge } from "lodash";
import {
  useCallback,
  useReducer,
  useRef,
  useEffect,
  MutableRefObject,
} from "react";
import {
  queryManagerReducer,
  QueryManagerReducerActionTypes,
  QueryManagerState,
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

const setConfig = <T>(
  propValues?: Partial<RequestConfig>,
  fetchFunc?: (...args: any) => Promise<Response<T> | void>
) => {
  const config = REQUEST_CONFIG_DEFAULT_VALUES;
  if (!isFunction(fetchFunc) || !propValues) {
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
  getQueryManagerStateSetters: () => QueryStateSetters;
  getTotalRecords: () => number;
  getIsInitialFetch: () => boolean;
  isLastPage: () => boolean;
  fetch: QueryManagerFetchFunc<ResponseItemT>;
  endInitialFetch: () => void;
};

type QueryManagerFetchFunc<ResponseItemT> = (
  params?: Partial<RequestParams>,
  ...args: any
) => Promise<Response<ResponseItemT> | void>;
// TODO ADD GO TO PREVIOUS PAGE
export type QueryStateSetters = {
  clearSorting: () => void;
  setSorting: (sortBy: string) => void;
  clearSearchQuery: () => void;
  setSearchQuery: (value: string) => void;
  resetPage: () => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
};

type RequestConfig = {
  isDisabled: boolean;
  defaultSort: string;
  fetchOnInit: boolean;
  recordsPerPage: number;
  fetchOnInputChange: boolean;
  preventFetchOnInputChange?: (params: Partial<RequestParams>) => void; 
  [key: string]: any;
};

const useQueryManager = <ResponseItemT>(
  fetchFunc?: (
    params: RequestParams,
    ...args: any
  ) => Promise<Response<ResponseItemT>> | Promise<void>,
  onAfterFetch?: (responseDetails: ResponseDetails<ResponseItemT>) => void,
  config?: Partial<RequestConfig>
): {
  queryManagerState: QueryManagerState;
  queryManagerApi: QueryManagerApi<ResponseItemT>;
} => {
  const [state, dispatch] = useReducer(queryManagerReducer, INITIAL_STATE);
  const requestConfigRef = useRef<RequestConfig | null>(null);
  const fetchTriggeredByInput = useRef(false);
  const isInitialFetchRef = useRef(true);
  const totalRecordsRef = useRef(0);
  const stateSettersRef = useRef<QueryStateSetters | null>(null);

  if (requestConfigRef.current == null) {
    requestConfigRef.current = setConfig<ResponseItemT>(config, fetchFunc);
  }

  const getRequestConfig = () => requestConfigRef.current as RequestConfig;
  const getQueryManagerStateSetters = useCallback(
    () => stateSettersRef.current as QueryStateSetters,
    []
  );
  const getTotalRecords = useCallback(() => totalRecordsRef.current, []);
  const getIsInitialFetch = useCallback(() => isInitialFetchRef.current, []);

  const fetch = useCallback(
    async (
      params?: Partial<RequestParams>,
      ...args: any
    ): Promise<Response<ResponseItemT> | void> => {
      if (!isFunction(fetchFunc)) return { data: [] };
      const requestConfig = getRequestConfig();
      const requestParams = {
        searchQuery: (params && params.searchQuery) || state.searchQuery,
        sort:
          (params && params.sort) || requestConfig.defaultSort || state.sort,
        page: (params && params.page) || state.page,
        recordsPerPage: requestConfig.recordsPerPage,
        ...params,
      };
      const response = await fetchFunc(requestParams, ...args);
      if (response) {
        totalRecordsRef.current = response.totalRecords || 0;
        isFunction(onAfterFetch) && onAfterFetch({
          ...response,
          params: requestParams
        });
        return response;
      }
    },
    [fetchFunc, state.searchQuery, state.page, state.sort]
  );
  // TODO MAKE RECORDS PER PAGE OR RATHER PAGE SIZE A PART OF STATE, ALSO RENAME
  const isLastPage = useCallback(() => {
    const totalRecords = totalRecordsRef.current;
    const { recordsPerPage } = getRequestConfig();
    if (totalRecords && recordsPerPage) {
      return state.page * recordsPerPage >= totalRecords;
    }
    return false;
  }, [state.page]);

  const goToNextPage = useCallback(
    () => dispatch({ type: QueryManagerReducerActionTypes.GO_TO_NEXT_PAGE }),
    []
  );
  const goToPage = useCallback(
    (page: number) =>
      dispatch({
        type: QueryManagerReducerActionTypes.GO_TO_PAGE,
        payload: page,
      }),
    []
  );
  const resetPage = useCallback(
    () => dispatch({ type: QueryManagerReducerActionTypes.RESET_PAGE }),
    []
  );
  const setSearchQuery = useCallback(
    (searchValue: string) => {
      fetchTriggeredByInput.current = true;
      dispatch({
        type: QueryManagerReducerActionTypes.SET_SEARCH_QUERY,
        payload: searchValue,
      })
    },
    []
  );
  const clearSearchQuery = useCallback(
    () => {
      fetchTriggeredByInput.current = true;
      dispatch({ type: QueryManagerReducerActionTypes.CLEAR_SEARCH_QUERY })
    },
    []
  );
  const setSorting = useCallback(
    (sortProperty: string) =>
      dispatch({
        type: QueryManagerReducerActionTypes.SET_SORTING,
        payload: sortProperty,
      }),
    []
  );
  const clearSorting = useCallback(
    () =>
      dispatch({
        type: QueryManagerReducerActionTypes.RESET_SORTING,
      }),
    []
  );

  const endInitialFetch = () => {
    isInitialFetchRef.current = false;
  };

  if (!stateSettersRef.current) {
    stateSettersRef.current = {
      clearSorting,
      setSorting,
      clearSearchQuery,
      setSearchQuery,
      resetPage,
      goToPage,
      goToNextPage,
    };
  }
  useEffect(() => {
    const requestConfig = getRequestConfig();
    if(!(requestConfig.isDisabled || fetchTriggeredByInput.current || (isInitialFetchRef.current && !requestConfig.fetchOnInit))) {
      (async () => {
        await fetch();
      })();
    }
    fetchTriggeredByInput.current = false;
  }, [state.page]);

  useEffect(() => {
    const {isDisabled, fetchOnInputChange, preventFetchOnInputChange} = getRequestConfig();
    if (
      isDisabled ||
      !fetchOnInputChange ||
      isInitialFetchRef.current ||
      (isFunction(preventFetchOnInputChange) && preventFetchOnInputChange(state))
    ) {
      return;
    }
    let timeoutId: NodeJS.Timeout | undefined;
    if (state.page === 1) {
      timeoutId = setTimeout(async () => {
        await fetch({ page: 1 });
      }, 700);
    }
    if (timeoutId) {
      return () => clearTimeout(timeoutId);
    }
  }, [state.searchQuery]);

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
      getTotalRecords,
      getQueryManagerStateSetters,
      isLastPage,
      fetch,
      getIsInitialFetch,
      endInitialFetch,
    },
  };
};

export default useQueryManager;
