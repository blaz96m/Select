import { filter, find, isEmpty, isFunction, trim } from "lodash";
import { useCallback, useEffect, Dispatch, SetStateAction } from "react";
import {
  SelectFetchFunc,
  SelectState,
  SelectOptionList,
  SelectOptionT,
} from "src/components/Select/types";
import { SelectApi } from "./useSelect";

import { useQueryManager } from "src/hooks/requests";
import { ResponseDetails } from "../requests/useQueryManager";
import { QueryManagerState } from "src/stores/reducers/queryManagerReducer";

export type SelectAsyncState = Pick<QueryManagerState, "searchQuery" | "page">;

export type SelectAsyncApi = {
  isLastPage: () => boolean;
  getIsInitialFetch: () => boolean | undefined;
  handlePageChangeAsync: () => void;
  resetPage: () => void;
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
    inputValue: string;
    setInputValue: Dispatch<SetStateAction<string>> | ((value: string) => void);
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
    inputValue,
    setInputValue,
  } = props;

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
    getIsInitialFetch,
    endInitialFetch,
    resetPage,
  } = queryManagerApi;

  const handlePageChangeAsync = useCallback(() => {
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
    isLastPage,
    getIsInitialFetch,
    handlePageChangeAsync,
    resetPage,
  };

  return { selectAsyncApi, selectAsyncState: queryManagerState };
};

export default useSelectAsync;
