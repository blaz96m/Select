import {
  head,
  toLower,
  filter,
  includes,
  trim,
  isEmpty,
  isArray,
  map,
  reduce,
  has,
  each,
} from "lodash";
import {
  SelectOptionList,
  SelectState,
  CategorizedSelectOptions,
  SelectOptionT,
} from "src/components/Select/types";
import { getObjectKeys } from "../data-types/objects/helpers";
import { INITIAL_STATE } from "./constants";

export const initializeState = (
  selectOptions: SelectOptionList | []
): SelectState => ({
  ...INITIAL_STATE,
  selectOptions: selectOptions,
});

export const getFirstOptionAndCategory = (
  categorizedOptions: CategorizedSelectOptions
) => {
  const categories = getObjectKeys(categorizedOptions);
  const firstCategory = head(categories) as string;
  return [head(categorizedOptions[firstCategory]), firstCategory];
};

export const filterOptionListBySearchValue = (
  options: SelectOptionList,
  labelKey: keyof SelectOptionT,
  searchValue: string
) => {
  const trimmedSearchValue = trim(toLower(searchValue));
  return filter(options, (option) => {
    const trimmedOptionLabel = trim(toLower(option[labelKey]));
    return includes(trimmedOptionLabel, trimmedSearchValue);
  });
};

export const filterDataBySelectedValues = (
  options: SelectOptionList | CategorizedSelectOptions,
  value: SelectOptionList,
  categoryKey: keyof SelectOptionT | string
) => {
  if (isEmpty(value)) {
    return options;
  }
  return !isEmpty(categoryKey)
    ? filterCategoriesBySelectedValues(
        options as CategorizedSelectOptions,
        value,
        categoryKey
      )
    : filterListBySelectedValues(options as SelectOptionList, value);
};

export const filterListBySelectedValues = (
  options: SelectOptionList,
  value: SelectOptionList
): SelectOptionList => {
  const valueIds = map(value, (val) => val.id);
  return filter(options, (option) => !includes(valueIds, option.id));
};

export const filterCategoriesBySelectedValues = (
  categories: CategorizedSelectOptions,
  value: SelectOptionList,
  categoryKey: keyof SelectOptionT
): CategorizedSelectOptions => {
  each(value, (val) => {
    const valueId = val.id;
    const category = val[categoryKey];
    const categoryOptions = categories[category];
    categories[category] = filter(
      categoryOptions,
      (option) => option.id !== valueId
    );
  });
  return categories;
};

export const filterSelectedValues = (
  options: SelectOptionList,
  value: SelectOptionList
) => {
  if (!value || isEmpty(value)) {
    return options;
  }

  const valueIds = isArray(value) ? map(value, (val) => val.id) : [];
  return filter(options, (option) => !includes(valueIds, option.id));
};

export const categorizeOptions = (
  options: SelectOptionList,
  categoryKey: keyof SelectOptionT
): CategorizedSelectOptions => {
  return reduce(
    options,
    (acc: CategorizedSelectOptions, nextValue: SelectOptionT) => {
      const categoryName = nextValue[categoryKey];
      if (has(acc, categoryName)) {
        acc[categoryName].push(nextValue);
      } else {
        acc[categoryName] = [];
        acc[categoryName].push(nextValue);
      }
      return acc;
    },
    {}
  );
};
