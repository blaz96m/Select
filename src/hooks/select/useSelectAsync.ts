import { filter, find, isEmpty, isFunction, trim } from "lodash";
import { useCallback, useEffect } from "react";
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
import { flushSync } from "react-dom";

export type SelectAsyncStateSetters = Pick<
  QueryStateSetters,
  "clearSearchQuery" | "goToNextPage" | "setSearchQuery"
>;

export type SelectAsyncState = Pick<QueryManagerState, "searchQuery" | "page">;

export type SelectAsyncApi = {
  getSelectAsyncStateSetters: () => SelectAsyncStateSetters;
  isLastPage: () => boolean;
  getIsInitialFetch: () => boolean | undefined;
  handlePageChangeAsync: () => void;
};

const useSelectAsync = (
  state: SelectState,
  selectApi: SelectApi,
  props: {
    recordsPerPage?: number;
    fetchOnInputChange?: boolean;
    originalOptions: React.MutableRefObject<SelectOptionList | []>;
    focusInput: () => void;
    onDropdownExpand: () => void;
    selectListContainerRef: React.RefObject<HTMLDivElement>;
    isLazyInit?: boolean;
    fetchOnScroll?: boolean;
    fetchFunc?: SelectFetchFunc;
  }
): { selectAsyncApi: SelectAsyncApi; selectAsyncState: SelectAsyncState } => {
  const { getSelectStateSetters } = selectApi;
  const {
    fetchFunc,
    fetchOnInputChange,
    isLazyInit,
    recordsPerPage,
    originalOptions,
    selectListContainerRef,
    onDropdownExpand,
  } = props;

  const shouldPreventInputFetch = (params: SelectAsyncState) => {
    const { searchQuery } = params;
    return !trim(searchQuery) && !isEmpty(state.value);
  };

  const updateSelectOptions = useCallback(
    (response: ResponseDetails<SelectOptionT>) => {
      const selectStateSetters = getSelectStateSetters();
      const { data, params } = response;
      // TODO - REMOVE
      if (params && params.page !== 1) {
        const klinData = filter(
          data,
          (d) => !find(state.selectOptions, (option) => option.id === d.id)
        );
        selectStateSetters.addOptions(klinData);
      } else {
        const isInitialFetch = getIsInitialFetch();
        // End the initial fetch in the case when lazy init is triggered and the response is empty (due to the select option useEffect that ends the initial fetch not being triggered)
        if (isLazyInit && isInitialFetch && isEmpty(response.data)) {
          endInitialFetch();
        }
        if (originalOptions?.current && isEmpty(originalOptions.current)) {
          originalOptions.current = data;
        }
        if (
          selectListContainerRef.current &&
          selectListContainerRef.current.scrollTop
        ) {
          selectListContainerRef.current.scroll({ top: 0 });
        }
        selectStateSetters.setOptions(data);
      }
    },
    [state.selectOptions]
  );

  const { queryManagerState, queryManagerApi } = useQueryManager<SelectOptionT>(
    fetchFunc,
    updateSelectOptions,
    {
      fetchOnInit: !isLazyInit,
      recordsPerPage,
      fetchOnInputChange,
      shouldPreventInputFetch,
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
    const { goToNextPage } = getQueryManagerStateSetters();
    !isLastPage() && goToNextPage();
  }, [isLastPage]);

  useEffect(() => {
    const isInitialFetch = getIsInitialFetch();
    if (isInitialFetch && isLazyInit && isFunction(fetchFunc) && state.isOpen) {
      (async () => {
        await fetch();
      })();
    }
  }, [state.isOpen]);

  useEffect(() => {
    const isInitialFetch = getIsInitialFetch();
    if (isLazyInit && isInitialFetch && state.isOpen) {
      onDropdownExpand();
      endInitialFetch();
    }
  }, [state.selectOptions]);

  const selectAsyncApi: SelectAsyncApi = {
    getSelectAsyncStateSetters: getQueryManagerStateSetters,
    isLastPage,
    getIsInitialFetch,
    handlePageChangeAsync,
  };

  return { selectAsyncApi, selectAsyncState: queryManagerState };
};

export default useSelectAsync;
