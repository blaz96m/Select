import { useMemo, useRef } from "react";
import { isFunction, isEmpty, slice } from "lodash";

import {
  CategorizedSelectOptions,
  SelectState,
  SelectOptionList,
  SelectOptionT,
  SelectSorterFunction,
  SelectFetchFunction,
} from "src/components/Select/types";
import {
  categorizeOptions,
  filterDataBySelectedValues,
} from "src/utils/select";

type SelectComputationProps = {
  labelKey: keyof SelectOptionT;
  isCategorized: boolean;
  categorizeFunction?: (options: SelectOptionList) => CategorizedSelectOptions;
  sorterFn?: SelectSorterFunction;
  fetchFunc?: SelectFetchFunction;
  categoryKey?: keyof SelectOptionT;
  recordsPerPage?: number;
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
  } = selectProps;

  const hasCategories =
    isCategorized && (!isEmpty(categoryKey) || isFunction(categorizeFunction));

  const partitionedOptions = useMemo((): SelectOptionList => {
    const options = [...state.selectOptions];
    if (
      !isFunction(fetchFunc) &&
      recordsPerPage &&
      !isEmpty(state.selectOptions)
    ) {
      return slice(options, 0, state.page * recordsPerPage);
    }
    return options;
  }, [state.selectOptions, state.page]);

  const categorizedOptions = useMemo((): CategorizedSelectOptions => {
    const options = [...partitionedOptions];
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
      ? { ...(categorizedOptions as CategorizedSelectOptions) }
      : [...partitionedOptions];
    const categoryKeyVal = isCategorized
      ? (categoryKey as keyof SelectOptionT)
      : "";
    return filterDataBySelectedValues(options, state.value, categoryKeyVal);
  }, [categorizedOptions]);

  const sortedOptions = useMemo(():
    | SelectOptionList
    | CategorizedSelectOptions => {
    const options = isCategorized
      ? { ...(filteredOptions as CategorizedSelectOptions) }
      : [...(filteredOptions as SelectOptionList)];
    if (isFunction(sorterFn)) {
      return sorterFn(options);
    }
    return options;
  }, [filteredOptions, sorterFn]);

  return sortedOptions;
};

export default useSelectComputation;
