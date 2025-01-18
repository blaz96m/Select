import { useMemo, useRef } from "react";
import { isFunction, isEmpty, slice, cloneDeep } from "lodash";

import {
  CategorizedSelectOptions,
  SelectState,
  SelectOptionList,
  SelectOptionT,
  SelectSorterFunction,
  SelectFetchFunc,
} from "src/components/Select/types";
import {
  categorizeOptions,
  filterDataBySelectedValues,
} from "src/utils/select";

type SelectComputationProps = {
  labelKey: keyof SelectOptionT;
  removeSelectedOptionsFromList: boolean;
  categorizeFunction?: (options: SelectOptionList) => CategorizedSelectOptions;
  sorterFn?: SelectSorterFunction;
  fetchFunc?: SelectFetchFunc;
  categoryKey?: keyof SelectOptionT;
  recordsPerPage?: number;
  isCategorized?: boolean;
};

const useSelectComputation = (
  state: SelectState,
  selectProps: SelectComputationProps
): SelectOptionList | CategorizedSelectOptions => {
  const {
    isCategorized,
    categoryKey,
    categorizeFunction,
    sorterFn,
    fetchFunc,
    recordsPerPage,
    removeSelectedOptionsFromList,
  } = selectProps;

  const hasCategories =
    isCategorized && (!isEmpty(categoryKey) || isFunction(categorizeFunction));

  const partitionedOptions = useMemo((): SelectOptionList | null => {
    const options = state.selectOptions;
    if (
      // TODO DECIDE WETHER THIS SHOULD BE DECIDED ON FETCH FUNC ALONE (PROBLY NOT)
      !isFunction(fetchFunc) &&
      recordsPerPage &&
      !isEmpty(state.selectOptions)
    ) {
      return slice(options, 0, state.page * recordsPerPage);
    }
    return options;
  }, [state.selectOptions, state.page]);

  const categorizedOptions = useMemo((): CategorizedSelectOptions => {
    const options = partitionedOptions || state.selectOptions;
    return hasCategories
      ? isFunction(categorizeFunction)
        ? categorizeFunction(options)
        : categorizeOptions(options, categoryKey as keyof SelectOptionT)
      : {};
  }, [hasCategories, partitionedOptions]);

  const filteredOptions = useMemo(():
    | SelectOptionList
    | CategorizedSelectOptions => {
    const options = isCategorized
      ? cloneDeep(categorizedOptions)
      : partitionedOptions || state.selectOptions;
    const categoryKeyVal = isCategorized
      ? (categoryKey as keyof SelectOptionT)
      : "";
    return removeSelectedOptionsFromList
      ? filterDataBySelectedValues(options, state.value, categoryKeyVal)
      : options;
  }, [categorizedOptions, state.value]);

  const sortedOptions = useMemo(():
    | SelectOptionList
    | CategorizedSelectOptions
    | null => {
    const options = isCategorized
      ? cloneDeep(filteredOptions)
      : (filteredOptions as SelectOptionList);
    if (isFunction(sorterFn)) {
      return sorterFn(options);
    }
    return null;
  }, [filteredOptions, sorterFn]);

  return sortedOptions || filteredOptions;
};

export default useSelectComputation;
