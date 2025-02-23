import { filter, find, isEmpty, isFunction, trim } from "lodash";
import { useCallback, useEffect, Dispatch, SetStateAction } from "react";
import {
  SelectOptionT,
  SelectFetchFunction,
} from "src/Select/types/selectGeneralTypes";
import {
  SelectStateUpdaters,
  SelectState,
  SelectApi,
  SelectAsyncApi,
} from "src/Select/types/selectStateTypes";

import { useQueryManager } from "src/general/hooks";
import { ResponseDetails } from "src/general/hooks/useQueryManager";
import { QueryManagerState } from "src/general/stores/queryManagerReducer";

type SelectAsyncState = Pick<QueryManagerState, "searchQuery" | "page">;

const useSelectAsync = (
  selectState: SelectState,
  selectApi: SelectApi,
  selectStateUpdaters: SelectStateUpdaters,
  selectProps: {
    updateSelectOptionsAfterFetch: boolean;
    fetchFunction: SelectFetchFunction | undefined;
    recordsPerPage?: number;
    isLoading: boolean | undefined;
    fetchOnInputChange?: boolean;
    isLazyInit?: boolean;
    fetchOnScroll?: boolean;
  }
): { selectAsyncApi: SelectAsyncApi; selectAsyncState: SelectAsyncState } => {
  const {
    fetchFunction,
    fetchOnInputChange,
    isLazyInit,
    recordsPerPage,
    fetchOnScroll,
    isLoading,
    updateSelectOptionsAfterFetch,
  } = selectProps;

  const {
    getOriginalOptions,
    selectDomRefs,
    setOriginalOptions,
    onDropdownExpand,
  } = selectApi;

  const { setInputValue } = selectStateUpdaters;

  const { inputValue, selectOptions, isOpen } = selectState;

  const updateSelectOptions = useCallback(
    async (response: ResponseDetails<SelectOptionT>) => {
      const { data, params } = response;
      // TODO - REMOVE
      if (params && params.page !== 1) {
        const klinData = filter(
          data,
          (d) => !find(selectOptions, (option) => option.id === d.id)
        );
        updateSelectOptionsAfterFetch &&
          selectStateUpdaters.addOptions(klinData);
      } else {
        const originalOptions = getOriginalOptions();
        if (isEmpty(originalOptions) && updateSelectOptionsAfterFetch) {
          // Set the original options only once in case the user wants to use frontend pagination, will not work properly if fetch on scroll is enabled
          setOriginalOptions(data);
        }
        if (
          selectDomRefs.selectListContainerRef.current &&
          selectDomRefs.selectListContainerRef.current.scrollTop
        ) {
          selectDomRefs.selectListContainerRef.current.scroll({ top: 0 });
        }
        updateSelectOptionsAfterFetch &&
          selectStateUpdaters.setSelectOptions(data);
      }
    },
    [selectOptions]
  );

  const { queryManagerState, queryManagerApi } = useQueryManager<SelectOptionT>(
    fetchFunction,
    updateSelectOptions,
    { searchQuery: inputValue, setSearchQuery: setInputValue },
    isLoading,
    {
      fetchOnInit: !isLazyInit,
      recordsPerPage,
      fetchOnInputChange,
    }
  );

  const { goToNextPage, isLastPage, fetch, isInitialFetch, resetPage } =
    queryManagerApi;

  const loadNextPageAsync = useCallback(() => {
    !isLastPage() && goToNextPage();
  }, [isLastPage]);

  const handlePageResetAsync = useCallback(() => {
    if (fetchOnScroll) {
      resetPage();
    }
  }, [fetchFunction, fetchOnScroll]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    if (isInitialFetch() && isLazyInit && isFunction(fetchFunction) && isOpen) {
      fetch({}, signal);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isLazyInit && isLoading && isOpen) {
      onDropdownExpand();
    }
  }, [selectOptions]);

  const selectAsyncApi: SelectAsyncApi = {
    isLastPage,
    isInitialFetch,
    loadNextPageAsync,
    handlePageResetAsync,
  };

  return { selectAsyncApi, selectAsyncState: queryManagerState };
};

export default useSelectAsync;
