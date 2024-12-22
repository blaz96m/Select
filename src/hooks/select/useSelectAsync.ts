import { isArray, isFunction, isObject, update } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import {
  SelectFetchFunc,
  SelectState,
  SelectOptionList,
  SelectOptionT,
} from "src/components/Select/types";
import { SelectApi } from "./useSelect";

import { useQueryManager } from "src/hooks/requests";
import {
  ResponseDetails,
  QueryStateSetters,
} from "../requests/useQueryManager";
import { QueryManagerState } from "src/stores/reducers/queryManagerReducer";

export type SelectAsyncStateSetters = Pick<
  QueryStateSetters,
  "clearSearchQuery" | "goToNextPage" | "setSearchQuery"
>;

export type SelectAsyncApi = {
  getSelectAsyncStateSetters: () => SelectAsyncStateSetters;
  getIsLastPage: () => boolean;
};

const useSelectAsync = (
  state: SelectState,
  selectApi: SelectApi,
  requestConfig: {
    fetchOnScroll: boolean;
    isLazyInit?: boolean;
    recordsPerPage?: number;
    fetchOnInputChange?: boolean;
    fetchFunc?: SelectFetchFunc;
  }
): { selectAsyncApi: SelectAsyncApi; selectAsyncState: QueryManagerState } => {
  const { getSelectStateSetters } = selectApi;
  const { isLazyInit, recordsPerPage } = requestConfig;
  const { fetchFunc, fetchOnInputChange } = requestConfig;

  const updateSelectOptions = useCallback(
    (response: ResponseDetails<SelectOptionT>) => {
      const selectStateSetters = getSelectStateSetters();
      const { data, updatedParams } = response;
      if (updatedParams && updatedParams.page !== 1) {
        return selectStateSetters.addOptions(data);
      }
      selectStateSetters.setOptions(data);
    },
    []
  );

  const { queryManagerState, queryManagerApi } = useQueryManager<SelectOptionT>(
    fetchFunc,
    updateSelectOptions,
    {
      fetchOnInit: !isLazyInit,
      recordsPerPage,
      fetchOnInputChange,
    }
  );
  const {
    getQueryManagerStateSetters,
    getIsLastPage,
    fetch,
    getIsInitialFetch,
  } = queryManagerApi;

  useEffect(() => {
    const isInitialFetch = getIsInitialFetch();
    if (isInitialFetch && isLazyInit && isFunction(fetchFunc)) {
      (async () => {
        const result = await fetch();
        result && updateSelectOptions(result);
      })();
    }
  }, [state.isOpen]);

  const selectAsyncApi = {
    getSelectAsyncStateSetters: getQueryManagerStateSetters,
    getIsLastPage,
  };

  return { selectAsyncApi, selectAsyncState: queryManagerState };
};

export default useSelectAsync;
