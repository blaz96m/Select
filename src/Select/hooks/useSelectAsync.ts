import { filter, find, isEmpty } from "lodash-es";
import { useCallback, useEffect } from "react";
import {
  SelectOptionT,
  SelectFetchFunction,
} from "src/Select/types/selectGeneralTypes";
import { SelectApi, SelectAsyncApi } from "src/Select/types/selectStateTypes";

import { useQueryManager } from "src/general/hooks";
import { ResponseDetails } from "src/general/hooks/useQueryManager";

const useSelectAsync = (
  selectApi: SelectApi,
  selectProps: {
    updateSelectOptionsAfterFetch: boolean;
    fetchFunction: SelectFetchFunction | undefined;
    useAsync: boolean;
    inputUpdateDebounceDuration?: number;
    isLoading: boolean | undefined;
    recordsPerPage?: number;
    fetchOnInputChange?: boolean;
    isLazyInit?: boolean;
    fetchOnScroll?: boolean;
  }
): { selectAsyncApi: SelectAsyncApi } => {
  const {
    fetchFunction,
    fetchOnInputChange,
    isLazyInit,
    recordsPerPage = 15,
    inputUpdateDebounceDuration,
    fetchOnScroll,
    isLoading,
    useAsync,
    updateSelectOptionsAfterFetch,
  } = selectProps;

  const {
    getOriginalOptions,
    selectDomRefs,
    setOriginalOptions,
    selectState,
    selectStateUpdaters,
  } = selectApi;

  const { setInputValue, loadNextPage, setPage } = selectStateUpdaters;

  const { inputValue, selectOptions, isOpen, page } = selectState;

  const fetchOnScrollToBottom = useAsync && fetchOnScroll;

  const updateSelectOptions = useCallback(
    async (response: ResponseDetails<SelectOptionT>) => {
      const { data, params } = response;
      if (params && params.page !== 1) {
        const klinData = filter(
          data,
          (d) => !find(selectOptions, (option) => option.id === d.id)
        );
        updateSelectOptionsAfterFetch &&
          selectStateUpdaters.addOptions(klinData);
      } else {
        const originalOptions = getOriginalOptions();
        const selectOptionListNode =
          selectDomRefs.selectListContainerRef.current;
        if (isEmpty(originalOptions) && updateSelectOptionsAfterFetch) {
          // Get a reference of all original options for frontend pagination, will not work if fetch on scroll or fetch on input is enabled
          setOriginalOptions(data);
        }
        if (selectOptionListNode && selectOptionListNode.scrollTop) {
          selectOptionListNode.scroll({ top: 0 });
        }
        updateSelectOptionsAfterFetch &&
          selectStateUpdaters.setSelectOptions(data);
      }
    },
    [selectOptions, selectStateUpdaters.addOptions]
  );

  const { queryManagerState, queryManagerApi } = useQueryManager<SelectOptionT>(
    fetchFunction,
    updateSelectOptions,
    { searchQuery: inputValue, setSearchQuery: setInputValue, page, setPage },
    isLoading,
    {
      fetchOnInit: !isLazyInit,
      isDisabled: !useAsync,
      recordsPerPage,
      inputFetchDeboubceDuration: inputUpdateDebounceDuration,
      fetchOnInputChange,
      fetchOnPageChange: useAsync && fetchOnScrollToBottom,
    }
  );

  const { isLastPage, fetch, isInitialFetch } = queryManagerApi;

  const loadNextPageAsync = useCallback(() => {
    !isLastPage() && !isLoading && loadNextPage();
  }, [isLastPage, loadNextPage, isLoading]);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    if (useAsync && isInitialFetch() && isLazyInit && isOpen) {
      fetch({}, signal);
    }
  }, [isOpen]);

  const selectAsyncApi: SelectAsyncApi = {
    isLastPage,
    isInitialFetch,
    fetchOnScrollToBottom,
    loadNextPageAsync,
  };

  return { selectAsyncApi };
};

export default useSelectAsync;
