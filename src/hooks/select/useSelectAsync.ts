import { filter, find, isEmpty, isFunction, trim } from "lodash";
import { useCallback, useEffect, Dispatch, SetStateAction } from "react";
import {
  SelectState,
  SelectOptionList,
  SelectOptionT,
  SelectStateUpdaters,
  SelectFetchFunc,
} from "src/components/Select/types";

import { useQueryManager } from "src/hooks/requests";
import { ResponseDetails } from "../requests/useQueryManager";
import { QueryManagerState } from "src/stores/reducers/queryManagerReducer";

export type SelectAsyncState = Pick<QueryManagerState, "searchQuery" | "page">;

export type SelectAsyncApi = {
  isLastPage: () => boolean;
  isInitialFetch: () => boolean;
  loadNextPageAsync: () => void;
  handlePageResetAsync: () => void;
};

const useSelectAsync = (
  state: SelectState,
  props: {
    recordsPerPage?: number;
    fetchOnInputChange?: boolean;
    getOriginalOptions: () => void;
    setOriginalOptions: (options: SelectOptionList) => void;
    focusInput: () => void;
    onDropdownExpand: () => void;
    selectStateUpdaters: SelectStateUpdaters;
    selectListContainerRef: React.RefObject<HTMLDivElement>;
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>> | ((value: string) => void);
    isLazyInit?: boolean;
    fetchOnScroll?: boolean;
    fetchFunction: SelectFetchFunc | undefined;
  }
): { selectAsyncApi: SelectAsyncApi; selectAsyncState: SelectAsyncState } => {
  const {
    fetchFunction,
    fetchOnInputChange,
    isLazyInit,
    recordsPerPage,
    getOriginalOptions,
    setOriginalOptions,
    selectListContainerRef,
    selectStateUpdaters,
    onDropdownExpand,
    inputValue,
    setInputValue,
    fetchOnScroll,
  } = props;

  const updateSelectOptions = useCallback(
    (response: ResponseDetails<SelectOptionT>) => {
      const { data, params } = response;
      // TODO - REMOVE
      if (params && params.page !== 1) {
        const klinData = filter(
          data,
          (d) => !find(state.selectOptions, (option) => option.id === d.id)
        );
        selectStateUpdaters.addOptions(klinData);
      } else {
        const originalOptions = getOriginalOptions();
        // End the initial fetch in the case when lazy init is triggered and the response is empty (due to the select option useEffect that ends the initial fetch not being triggered)
        if (isLazyInit && isInitialFetch() && isEmpty(response.data)) {
          endInitialFetch();
        }
        if (isEmpty(originalOptions)) {
          setOriginalOptions(data);
        }
        if (
          selectListContainerRef.current &&
          selectListContainerRef.current.scrollTop
        ) {
          selectListContainerRef.current.scroll({ top: 0 });
        }
        selectStateUpdaters.setSelectOptions(data);
      }
    },
    [state.selectOptions]
  );

  const { queryManagerState, queryManagerApi } = useQueryManager<SelectOptionT>(
    fetchFunction,
    updateSelectOptions,
    { searchQuery: inputValue, setSearchQuery: setInputValue },
    {
      fetchOnInit: !isLazyInit,
      recordsPerPage,
      fetchOnInputChange,
    }
  );

  const {
    goToNextPage,
    isLastPage,
    fetch,
    isInitialFetch,
    endInitialFetch,
    resetPage,
  } = queryManagerApi;

  const loadNextPageAsync = useCallback(() => {
    !isLastPage() && goToNextPage();
  }, [isLastPage]);

  const handlePageResetAsync = useCallback(() => {
    if (fetchOnScroll) {
      resetPage();
    }
  }, [fetchFunction, fetchOnScroll]);

  useEffect(() => {
    if (
      isInitialFetch() &&
      isLazyInit &&
      isFunction(fetchFunction) &&
      state.isOpen
    ) {
      (async () => {
        await fetch();
      })();
    }
  }, [state.isOpen]);

  useEffect(() => {
    if (isLazyInit && isInitialFetch() && state.isOpen) {
      onDropdownExpand();
      endInitialFetch();
    }
  }, [state.selectOptions]);

  const selectAsyncApi: SelectAsyncApi = {
    isLastPage,
    isInitialFetch,
    loadNextPageAsync,
    handlePageResetAsync,
  };

  return { selectAsyncApi, selectAsyncState: queryManagerState };
};

export default useSelectAsync;
