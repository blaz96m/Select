import { isArray, isEmpty, isFunction, isObject, trim, update } from "lodash";
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

export type SelectAsyncState = Pick<QueryManagerState, "searchQuery" | "page">

export type SelectAsyncApi = {
  getSelectAsyncStateSetters: () => SelectAsyncStateSetters;
  isLastPage: () => boolean;
  handlePageChangeAsync: () => void;
};

const useSelectAsync = (
  state: SelectState,
  selectApi: SelectApi,
  props: {
    fetchOnScroll: boolean;
    recordsPerPage?: number;
    fetchOnInputChange?: boolean;
    originalOptions: React.MutableRefObject<SelectOptionList | []>
    focusInput: () => void;
    selectListContainerRef: React.RefObject<HTMLDivElement>;
    isLazyInit?: boolean;
    fetchFunc?: SelectFetchFunc;
  }
): { selectAsyncApi: SelectAsyncApi; selectAsyncState: SelectAsyncState } => {
  const { getSelectStateSetters } = selectApi;
  const { fetchFunc, fetchOnInputChange, isLazyInit, recordsPerPage, originalOptions,  selectListContainerRef } = props;

  const shouldPreventInputFetch = (params: SelectAsyncState) => {
    const { searchQuery }= params;
    return !trim(searchQuery) && !isEmpty(state.value)

  }

  const updateSelectOptions = useCallback(
    (response: ResponseDetails<SelectOptionT>) => {
      const selectStateSetters = getSelectStateSetters();
      console.log(selectListContainerRef)
      const { data, params } = response;
      if (params && params.page !== 1) {
         selectStateSetters.addOptions(data);
      }else {
      if(originalOptions?.current && isEmpty(originalOptions.current)) {
        originalOptions.current = data;
      }
      if(selectListContainerRef.current && selectListContainerRef.current.scrollTop) {
        selectListContainerRef.current.scroll({top: 0})
      }
      selectStateSetters.setOptions(data)
    }
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
      shouldPreventInputFetch
    }
  );
  const {
    getQueryManagerStateSetters,
    isLastPage,
    fetch,
    getIsInitialFetch,
    endInitialFetch,
    
  } = queryManagerApi;

  const handlePageChangeAsync = useCallback(() => {
    const {goToNextPage} = getQueryManagerStateSetters();
    !isLastPage() && goToNextPage();
  }, [isLastPage])

  useEffect(() => {
    const isInitialFetch = getIsInitialFetch();
    if (isInitialFetch && isLazyInit && isFunction(fetchFunc) && state.isOpen) {
      (async () => {
        await fetch();
        endInitialFetch();
      })();
      
    }
  }, [state.isOpen]);

  const selectAsyncApi = {
    getSelectAsyncStateSetters: getQueryManagerStateSetters,
    isLastPage,
    handlePageChangeAsync
  };

  return { selectAsyncApi, selectAsyncState: queryManagerState };
};

export default useSelectAsync;
