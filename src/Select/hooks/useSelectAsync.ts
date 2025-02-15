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
} from "src/Select/types/selectStateTypes";

import { useQueryManager } from "src/hooks/requests";
import { ResponseDetails } from "../../hooks/requests/useQueryManager";
import { QueryManagerState } from "src/stores/reducers/queryManagerReducer";

type SelectAsyncState = Pick<QueryManagerState, "searchQuery" | "page">;

type SelectAsyncApi = {
  isLastPage: () => boolean;
  isInitialFetch: () => boolean;
  loadNextPageAsync: () => void;
  handlePageResetAsync: () => void;
};

const useSelectAsync = (
  selectState: SelectState,
  selectApi: SelectApi,
  selectStateUpdaters: SelectStateUpdaters,
  props: {
    recordsPerPage?: number;
    fetchOnInputChange?: boolean;
    isLazyInit?: boolean;
    fetchOnScroll?: boolean;
    fetchFunction: SelectFetchFunction | undefined;
  }
): { selectAsyncApi: SelectAsyncApi; selectAsyncState: SelectAsyncState } => {
  const {
    fetchFunction,
    fetchOnInputChange,
    isLazyInit,
    recordsPerPage,
    fetchOnScroll,
  } = props;

  const {
    getOriginalOptions,
    selectDomRefs,
    setOriginalOptions,
    onDropdownExpand,
  } = selectApi;

  const { setInputValue } = selectStateUpdaters;

  const { inputValue, selectOptions, isOpen } = selectState;

  const updateSelectOptions = useCallback(
    (response: ResponseDetails<SelectOptionT>) => {
      const { data, params } = response;
      // TODO - REMOVE
      if (params && params.page !== 1) {
        const klinData = filter(
          data,
          (d) => !find(selectOptions, (option) => option.id === d.id)
        );
        selectStateUpdaters.addOptions(klinData);
      } else {
        const originalOptions = getOriginalOptions();
        // TODO CHECK IF THIS APPLIES TO THE NORMAL REQUEST AS WELL
        // End the initial fetch in the case when lazy init is triggered and the response is empty (due to the select option useEffect that ends the initial fetch not being triggered)
        if (isLazyInit && isInitialFetch() && isEmpty(response.data)) {
          endInitialFetch();
        }
        if (isEmpty(originalOptions)) {
          setOriginalOptions(data);
        }
        if (
          selectDomRefs.selectListContainerRef.current &&
          selectDomRefs.selectListContainerRef.current.scrollTop
        ) {
          selectDomRefs.selectListContainerRef.current.scroll({ top: 0 });
        }
        selectStateUpdaters.setSelectOptions(data);
      }
    },
    [selectOptions]
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
    if (isInitialFetch() && isLazyInit && isFunction(fetchFunction) && isOpen) {
      (async () => {
        await fetch();
      })();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isLazyInit && isInitialFetch() && isOpen) {
      onDropdownExpand();
      endInitialFetch();
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
