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
  fetchFunc?: (...args: any) => Promise<Response<T>>
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
  updatedParams?: Partial<RequestParams>;
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
  getIsLastPage: () => boolean;
  fetch: QueryManagerFetchFunc<ResponseItemT>;
};

type QueryManagerFetchFunc<ResponseItemT> = (
  params?: Partial<RequestParams>,
  ...args: any
) => Promise<Response<ResponseItemT>>;
// TODO ADD GO TO PREVIOUS PAGE
export type QueryStateSetters = {
  clearSorting: () => void;
  setSorting: (sortBy: string) => void;
  clearSearchQuery: () => void;
  setSearchQuery: (value: string) => void;
  resetPage: () => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  endInitialFetch: () => void;
};

type RequestConfig = {
  isDisabled: boolean;
  defaultSort: string;
  fetchOnInit: boolean;
  recordsPerPage: number;
  fetchOnInputChange: boolean;
  [key: string]: any;
};

const useQueryManager = <ResponseItemT>(
  fetchFunc?: (
    params: RequestParams,
    ...args: any
  ) => Promise<Response<ResponseItemT>>,
  onAfterFetch?: (responseDetails: ResponseDetails<ResponseItemT>) => void,
  config?: Partial<RequestConfig>
): {
  queryManagerState: QueryManagerState;
  queryManagerApi: QueryManagerApi<ResponseItemT>;
} => {
  const [state, dispatch] = useReducer(queryManagerReducer, INITIAL_STATE);
  const requestConfigRef = useRef<RequestConfig | null>(null);
  const requestConfig = setConfig<ResponseItemT>(config, fetchFunc);
  const fetchTriggeredByInput = useRef(false);
  const isInitialFetchRef = useRef(true);
  const totalRecordsRef = useRef(0);
  const stateSettersRef = useRef<QueryStateSetters | null>(null);

  if (requestConfig.current == null) {
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
    ): Promise<Response<ResponseItemT>> => {
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
      totalRecordsRef.current = response.totalRecords || 0;
      return response;
    },
    [fetchFunc, state.searchQuery, state.page, state.sort]
  );
  // TODO MAKE RECORDS PER PAGE OR RATHER PAGE SIZE A PART OF STATE
  const getIsLastPage = useCallback(() => {
    const totalRecords = totalRecordsRef.current;
    const { recordsPerPage } = getRequestConfig();
    if (totalRecords && requestConfig.recordsPerPage) {
      return state.page * recordsPerPage < totalRecords;
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
    (searchValue: string) =>
      dispatch({
        type: QueryManagerReducerActionTypes.SET_SEARCH_QUERY,
        payload: searchValue,
      }),
    []
  );
  const clearSearchQuery = useCallback(
    () => dispatch({ type: QueryManagerReducerActionTypes.CLEAR_SEARCH_QUERY }),
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

  const isInitialFetch = isInitialFetchRef.current;

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
      endInitialFetch,
    };
  }
  useEffect(() => {
    const requestConfig = getRequestConfig();
    if (
      requestConfig.isDisabled ||
      fetchTriggeredByInput.current ||
      (isInitialFetch && !requestConfig.fetchOnInit)
    ) {
      return;
    }
    (async () => {
      const response = await fetch();
      fetchTriggeredByInput.current = false;
      if (isFunction(onAfterFetch) && response) {
        onAfterFetch({ ...response, updatedParams: { page: state.page } });
      }
    })();
  }, [state.page]);

  useEffect(() => {
    const requestConfig = getRequestConfig();
    if (
      requestConfig.isDisabled ||
      !requestConfig.fetchOnInputChange ||
      isInitialFetch
    ) {
      return;
    }
    let timeoutId: NodeJS.Timeout | undefined;
    if (state.page === 1) {
      timeoutId = setTimeout(async () => {
        const response = await fetch({ page: 1 });
        fetchTriggeredByInput.current = true;
        if (isFunction(onAfterFetch) && response) {
          onAfterFetch({
            ...response,
            updatedParams: { page: 1, searchQuery: state.searchQuery },
          });
        }
      }, 700);
    }
    if (timeoutId) {
      return () => clearTimeout(timeoutId);
    }
  }, [state.searchQuery]);

  useEffect(() => {
    if (requestConfig.isDisabled || isInitialFetch) return;
    (async () => {
      const response = await fetch();
      if (isFunction(onAfterFetch) && response) {
        //TODO MAYBE ON AFTER FETCH SHOULD RUN EVEN IF WE DONT GET THE RESPONSE?
        onAfterFetch({ ...response, updatedParams: { sort: state.sort } });
      }
    })();
  }, [state.sort]);

  return {
    queryManagerState: state,
    queryManagerApi: {
      getTotalRecords,
      getQueryManagerStateSetters,
      getIsLastPage,
      fetch,
      getIsInitialFetch,
    },
  };
};

export default useQueryManager;
