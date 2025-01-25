import {
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
  findIndex,
} from "lodash";
import {
  SelectOptionList,
  SelectState,
  CategorizedSelectOptions,
  SelectOptionT,
  SelectKeyboardNavigationDirection,
  SelectFocusDetails,
  SelectComponents,
  SelectOptionInnerProps,
  SelectOptionComponentHandlers,
  SelectInputComponentHandlers,
  SelectInputInnerProps,
  SelectComponentHandlers,
  CustomClass,
} from "src/components/Select/types";
import { getObjectKeys } from "../data-types/objects/helpers";
import { INITIAL_STATE } from "./constants";
import { SelectOptionProps } from "src/components/Select/SelectOption";

export const initializeState = (
  selectOptions: SelectOptionList | []
): SelectState => ({
  ...INITIAL_STATE,
  selectOptions: selectOptions,
});

export const getFirstOptionAndCategory = (
  categorizedOptions: CategorizedSelectOptions
): SelectFocusDetails | null => {
  const categories = getObjectKeys(categorizedOptions);
  if (isEmpty(categories)) return null;
  const firstCategory = categories[0];
  const firstOption = categorizedOptions[firstCategory][0];
  return {
    focusedOptionId: firstOption?.id,
    focusedCategory: firstCategory,
  };
};

export const getLastOptionAndCategory = (
  categorizedOptions: CategorizedSelectOptions
): SelectFocusDetails | null => {
  const categories = getObjectKeys(categorizedOptions);
  if (isEmpty(categories)) return null;
  const lastCategory = categories[categories.length - 1];
  const lastOption = categorizedOptions[lastCategory].slice(-1)[0];
  return { focusedOptionId: lastOption?.id, focusedCategory: lastCategory };
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

const getFocusedOptionIdx = (
  options: SelectOptionList,
  focusedOptionId: string
) => {
  return findIndex(options, (option) => {
    return option.id == focusedOptionId;
  });
};

const getFocusedCategorizedOptionIdx = (
  options: CategorizedSelectOptions,
  focusedOptionId: string,
  focusedCategory: keyof SelectOptionT
) => {
  const focusedCategoryOptions = options[focusedCategory];
  return getFocusedOptionIdx(focusedCategoryOptions, focusedOptionId);
};

const getFocusedCategoryIdx = (
  categories: string[],
  focusedCategory: keyof SelectOptionT
) => findIndex(categories, (category) => category === focusedCategory);

export const getNextOption = (
  options: SelectOptionList | CategorizedSelectOptions,
  currFocusedIdx: number,
  focusedCategory?: keyof SelectOptionT
) =>
  focusedCategory
    ? (options as CategorizedSelectOptions)[focusedCategory][currFocusedIdx + 1]
    : (options as SelectOptionList)[currFocusedIdx + 1];

export const getPreviousOption = (
  options: SelectOptionList | CategorizedSelectOptions,
  currFocusedIdx: number,
  focusedCategory?: keyof SelectOptionT
) =>
  focusedCategory
    ? (options as CategorizedSelectOptions)[focusedCategory][currFocusedIdx - 1]
    : (options as SelectOptionList)[currFocusedIdx - 1];

export const isDirectionBottom = (
  direction: SelectKeyboardNavigationDirection
) => direction === "down";

export const getOptionFocusDetailsOnNavigation = (
  focusedOptionId: string,
  options: SelectOptionList | CategorizedSelectOptions,
  direction: SelectKeyboardNavigationDirection,
  focusedCategory?: keyof SelectOptionT
): SelectFocusDetails | null => {
  const categories = focusedCategory && getObjectKeys(options);
  const currFocusedOptionIdx = focusedCategory
    ? getFocusedCategorizedOptionIdx(
        options as CategorizedSelectOptions,
        focusedOptionId,
        focusedCategory
      )
    : getFocusedOptionIdx(options as SelectOptionList, focusedOptionId);
  const currFocusedCategoryIdx = categories
    ? getFocusedCategoryIdx(categories, focusedCategory)
    : -1;
  const currCategory = categories && categories[currFocusedCategoryIdx];

  if (currFocusedOptionIdx !== -1) {
    if (isDirectionBottom(direction)) {
      const nextOption = getNextOption(
        options,
        currFocusedOptionIdx,
        focusedCategory
      );
      const nextCategory = categories && categories[currFocusedCategoryIdx + 1];

      if (nextOption) {
        return {
          focusedOptionId: nextOption.id,
          focusedCategory: currCategory,
        };
      }
      if (nextCategory) {
        const nextCategoryOptions = (options as CategorizedSelectOptions)[
          nextCategory
        ];

        return {
          focusedOptionId: nextCategoryOptions[0].id,
          focusedCategory: nextCategory,
        };
      }

      return null;
    } else {
      const previousOption = getPreviousOption(
        options,
        currFocusedOptionIdx,
        focusedCategory
      );
      const prevCategory = categories && categories[currFocusedCategoryIdx - 1];

      if (previousOption) {
        return {
          focusedOptionId: previousOption.id,
          focusedCategory: currCategory,
        };
      }
      if (prevCategory) {
        const prevCategoryOptions = (options as CategorizedSelectOptions)[
          prevCategory
        ];

        return {
          focusedOptionId:
            prevCategoryOptions[prevCategoryOptions.length - 1].id,
          focusedCategory: prevCategory,
        };
      }

      return null;
    }
  }
  return null;
};

export const isFocusedOptionInViewport = (
  listContainer: HTMLDivElement,
  focusedOption: HTMLDivElement
): boolean => {
  const { clientHeight: listClientHeight } = listContainer;

  const focusedOptionRect = focusedOption.getBoundingClientRect();
  const listContainerRect = listContainer.getBoundingClientRect();

  const optionOfsetTop = focusedOptionRect.top - listContainerRect.top;
  return (
    // prettier-ignore
    (listClientHeight - optionOfsetTop >
      focusedOptionRect.height) &&
    (optionOfsetTop > 0)
  );
};

export const scrollToTarget = (
  target: HTMLDivElement,
  options: ScrollIntoViewOptions = { behavior: "smooth", block: "center" }
) => {
  if (!target) return;
  target.scrollIntoView(options);
};

export const generateComponentInnerProps = (
  componentType: keyof typeof SelectComponents,
  props: SelectComponentHandlers
) => {
  switch (componentType) {
    case SelectComponents.SELECT_OPTION:
      return generateSelectOptionInnerProps(
        props as SelectOptionComponentHandlers
      );
    case SelectComponents.INPUT:
      return generateSelectInputInnerProps(
        props as SelectInputComponentHandlers
      );
  }
};

const generateSelectOptionInnerProps = (
  props: SelectOptionComponentHandlers
): SelectOptionInnerProps => {
  const {
    handleMouseHover,
    handleOptionClick,
    option,
    isCategorized,
    categoryKey,
    className,
    refCallback,
  } = props;
  const hasCategories = categoryKey && isCategorized;
  const id = option!.id;

  return {
    id,
    "data-category": hasCategories ? option![categoryKey] : "",
    className,
    ref: refCallback,
    onClick: handleOptionClick,
    onMouseMove: handleMouseHover,
  };
};

const generateSelectInputInnerProps = (
  props: SelectInputComponentHandlers
): SelectInputInnerProps => {
  const {
    handleInputChange,
    handleKeyPress,
    inputValue,
    innerRef,
    className,
    isLoading,
  } = props;
  return {
    onChange: handleInputChange,
    onKeyDown: handleKeyPress,
    value: inputValue,
    disabled: isLoading,
    ref: innerRef,
    className,
  };
};

export const applyCustomClass = (
  defaultClass: string,
  customClass: CustomClass
) => {
  const { className, override } = customClass;
  return override ? className : `${defaultClass} ${className}`;
};

export const calculateSpaceAndDisplayOptionList = (
  selectOptionListRef: HTMLDivElement
) => {
  if (selectOptionListRef) {
    const optionListElement = selectOptionListRef;
    const optionListElementHeight = optionListElement.scrollHeight;
    const optionListRect = optionListElement.getBoundingClientRect();
  }
};
