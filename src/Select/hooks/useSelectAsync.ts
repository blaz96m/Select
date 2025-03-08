import { filter, find, isEmpty, isFunction, trim } from "lodash";
import { useCallback, useEffect, Dispatch, SetStateAction } from "react";
import {
  SelectOptionT,
  SelectFetchFunction,
} from "src/Select/types/selectGeneralTypes";
import { SelectApi, SelectAsyncApi } from "src/Select/types/selectStateTypes";

import { useQueryManager } from "src/general/hooks";
import { ResponseDetails } from "src/general/hooks/useQueryManager";
import { QueryManagerState } from "src/general/stores/queryManagerReducer";

type SelectAsyncState = Pick<QueryManagerState, "searchQuery" | "page">;

const useSelectAsync = (
  selectApi: SelectApi,
  selectProps: {
    updateSelectOptionsAfterFetch: boolean;
    fetchFunction: SelectFetchFunction | undefined;
    useAsync: boolean;
    inputUpdateDebounceDuration: number;
    debounceInputUpdate: boolean;
    isLoading: boolean | undefined;
    recordsPerPage?: number;
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
    inputUpdateDebounceDuration,
    debounceInputUpdate,
    fetchOnScroll,
    isLoading,
    useAsync,
    updateSelectOptionsAfterFetch,
  } = selectProps;

  const {
    getOriginalOptions,
    selectDomRefs,
    setOriginalOptions,
    onDropdownExpand,
    selectFocusHandlers,
  } = selectApi;

  const { selectState, selectStateUpdaters, focusInput } = selectApi;

  const { setInputValue, loadNextPage, setPage } = selectStateUpdaters;

  const { inputValue, selectOptions, isOpen, page } = selectState;

  const { resetFocus } = selectFocusHandlers;

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
    }
  );

  const fetchOnScrollToBottom = useAsync && fetchOnScroll;

  const { isLastPage, fetch, isInitialFetch } = queryManagerApi;

  const loadNextPageAsync = useCallback(() => {
    !isLastPage() && loadNextPage();
  }, [isLastPage, loadNextPage]);

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

  useEffect(() => {
    if (page === 1 && !isEmpty(selectOptions)) {
      resetFocus();
    }

    if (isLazyInit && !isLoading && isOpen) {
      onDropdownExpand();
    }
  }, [selectOptions]);

  useEffect(() => {
    if (isOpen) {
      focusInput();
    }
  }, [isLoading]);

  return { selectAsyncApi, selectAsyncState: queryManagerState };
};

export default useSelectAsync;
