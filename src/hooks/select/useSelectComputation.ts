import { useMemo, useRef } from "react";
import { isFunction, isEmpty } from "lodash";

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
  categoryKey?: keyof SelectOptionT;
};

const useSelectComputation = (
  state: SelectState,
  selectProps: SelectComputationProps,
  sorterFn?: SelectSorterFunction
): SelectOptionList | CategorizedSelectOptions => {
  const { isCategorized, categoryKey, categorizeFunction } = selectProps;

  const hasCategories =
    isCategorized && (!isEmpty(categoryKey) || isFunction(categorizeFunction));

  const categorizedOptions = useMemo((): CategorizedSelectOptions => {
    const options = [...state.selectOptions];
    return hasCategories
      ? isFunction(categorizeFunction)
        ? categorizeFunction(options)
        : categorizeOptions(options, categoryKey as keyof SelectOptionT)
      : {};
  }, [hasCategories, state.selectOptions]);

  const filteredOptions = useMemo(():
    | SelectOptionList
    | CategorizedSelectOptions => {
    console.log("CALLED FILTER");
    const options = isCategorized
      ? { ...(categorizedOptions as CategorizedSelectOptions) }
      : [...(state.selectOptions as SelectOptionList)];
    const categoryKeyVal = isCategorized
      ? (categoryKey as keyof SelectOptionT)
      : "";
    return filterDataBySelectedValues(options, state.value, categoryKeyVal);
  }, [state.selectOptions]);

  const sortedOptions = useMemo(():
    | SelectOptionList
    | CategorizedSelectOptions => {
    console.log("CALLED SORT");
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
