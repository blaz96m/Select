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
  head,
  last,
  first,
  isNumber,
  cloneDeep,
  isNil,
  isFunction,
} from "lodash";
import {
  SelectOptionList,
  CategorizedSelectOptions,
  SelectOptionT,
  SelectKeyboardNavigationDirection,
  CustomClassName,
  SelectFocusNavigationFallbackDirection,
  SelectCategoryFocusDetails,
  SelectOptionFilter,
} from "src/Select/types/selectGeneralTypes";

import { StateSetter, SelectState } from "src/Select/types/selectStateTypes";
import {
  SelectComponents,
  SelectOptionInnerProps,
  SelectInputInnerProps,
} from "src/Select/types/selectComponentTypes";
import { getObjectKeys } from "../../utils/data-types/objects/helpers";
import { FALLBACK_CATEGORY_NAME, INITIAL_STATE } from "./constants";
import { RefObject } from "react";

export const initializeState = (
  selectOptions: SelectOptionList | undefined
): SelectState => ({
  ...INITIAL_STATE,
  selectOptions: selectOptions || [],
});

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

export const filterOptionList = (
  options: SelectOptionList,
  value: SelectOptionList,
  removeSelectedOptionsFromList: boolean,
  customOptionFilter?: SelectOptionFilter
): SelectOptionList => {
  const valueIds = map(value, (val) => val.id);
  return filter(options, (option) => {
    return (
      (removeSelectedOptionsFromList ? !includes(valueIds, option.id) : true) &&
      (isFunction(customOptionFilter) ? customOptionFilter(option) : true)
    );
  });
};

export const isFocusedOptionIndexValid = (focusedOptionIdx: number | null) =>
  isNumber(focusedOptionIdx) && focusedOptionIdx >= 0;

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
      const categoryName = nextValue[categoryKey] || FALLBACK_CATEGORY_NAME;
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

const getNextOptionIdxInDirection = (
  focusedOptionIdx: number,
  optionList: SelectOptionList,
  direction: SelectKeyboardNavigationDirection
) => {
  const nextIdxInDirection = getNextIdxInDirection(direction, focusedOptionIdx);
  const nextOptionInDirection = optionList[nextIdxInDirection];
  return nextOptionInDirection ? nextIdxInDirection : null;
};

const getOppositeDirectionOptionIdx = (
  selectOptions: SelectOptionList,
  direction: SelectKeyboardNavigationDirection
) => (direction === "next" ? 0 : selectOptions.length - 1);

const getPreviousOptionIdx = (focusedOptionIdx: number) => focusedOptionIdx - 1;

const getNextOptionIdx = (focusedOptionIdx: number) => focusedOptionIdx + 1;

const getNextCategoryAndOptionInDirection = (
  categories: string[],
  categorizedOptions: CategorizedSelectOptions,
  focusedCategory: keyof SelectOptionT,
  direction: SelectKeyboardNavigationDirection
): SelectCategoryFocusDetails | null => {
  const currCategoryIdx = findIndex(
    categories,
    (category) => category === focusedCategory
  );
  const nextCategoryIdxInDirection = getNextIdxInDirection(
    direction,
    currCategoryIdx
  );
  const nextCategoryInDirection = categories[nextCategoryIdxInDirection];
  return nextCategoryInDirection
    ? {
        focusedCategory: nextCategoryInDirection,
        focusedOptionIdx: getFocusedOptionIdxOnCategoryChange(
          direction,
          categorizedOptions[nextCategoryInDirection]
        ),
      }
    : null;
};

const getOppositeDirectionCategoryAndOption = (
  categories: string[],
  categorizedOptions: CategorizedSelectOptions,
  direction: SelectKeyboardNavigationDirection
): SelectCategoryFocusDetails => {
  const targetCategory =
    direction === "next" ? first(categories) : last(categories);
  const targetOptionIdx = getFocusedOptionIdxOnCategoryChange(
    direction,
    categorizedOptions[targetCategory!]
  );
  return {
    focusedCategory: targetCategory!,
    focusedOptionIdx: targetOptionIdx,
  };
};

const getFallbackFocusOptionIdx = (
  fallbackDirection: SelectFocusNavigationFallbackDirection,
  focusedOptionIdx: number,
  selectOptions: SelectOptionList,
  direction: SelectKeyboardNavigationDirection
) => {
  switch (fallbackDirection) {
    case "opposite":
      return getOppositeDirectionOptionIdx(selectOptions, direction);
    case "previous":
      return getPreviousOptionIdx(focusedOptionIdx);
    case "next":
      return getNextOptionIdx(focusedOptionIdx);
  }
};

const getFallbackFocusCategory = (
  fallbackDirection: SelectFocusNavigationFallbackDirection,
  categories: string[],
  categorizedOptions: CategorizedSelectOptions,
  focusedCategory: keyof SelectOptionT,
  direction: SelectKeyboardNavigationDirection
) => {
  switch (fallbackDirection) {
    case "opposite":
      return getOppositeDirectionCategoryAndOption(
        categories,
        categorizedOptions,
        direction
      );
    case "previous":
      return getNextCategoryAndOptionInDirection(
        categories,
        categorizedOptions,
        focusedCategory,
        "previous"
      );
    case "next":
      return getNextCategoryAndOptionInDirection(
        categories,
        categorizedOptions,
        focusedCategory,
        "next"
      );
  }
};

const getNextIdxInDirection = (
  direction: SelectKeyboardNavigationDirection,
  currItemIdx: number
) => (direction === "next" ? currItemIdx + 1 : currItemIdx - 1);

const getFocusedOptionIdxOnCategoryChange = (
  direction: SelectKeyboardNavigationDirection,
  categoryOptions: SelectOptionList
) => (direction === "next" ? 0 : categoryOptions.length - 1);

const getFocusedCategoryOptionIdx = (
  focusedOptionIdx: number,
  focusedCategoryOptions: SelectOptionList,
  direction: SelectKeyboardNavigationDirection,
  fallbackDirection: SelectFocusNavigationFallbackDirection,
  checkFallback?: boolean
) => {
  const nextCategoryOptionIdxInDirection = getNextOptionIdxInDirection(
    focusedOptionIdx,
    focusedCategoryOptions,
    direction
  );
  if (isFocusedOptionIndexValid(nextCategoryOptionIdxInDirection)) {
    return nextCategoryOptionIdxInDirection;
  }
  return checkFallback &&
    (fallbackDirection === "next" || fallbackDirection === "previous")
    ? getNextOptionIdxInDirection(
        focusedOptionIdx,
        focusedCategoryOptions,
        fallbackDirection!
      )
    : null;
};

const getFallbackCategoryOptionIdx = (
  focusedOptionIdx: number,
  focusedCategoryOptions: SelectOptionList,
  direction: SelectKeyboardNavigationDirection
) => {
  return direction === "next" || direction === "previous"
    ? getNextOptionIdxInDirection(
        focusedOptionIdx,
        focusedCategoryOptions,
        direction
      )
    : null;
};

export const getCategoryFocusDetails = (
  focusedOptionIdx: number | null,
  focusedCategory: keyof SelectOptionT,
  categorizedOptions: CategorizedSelectOptions,
  direction: SelectKeyboardNavigationDirection,
  fallbackDirection: SelectFocusNavigationFallbackDirection,
  // Check if an option exists in the fallback direction provided before checking for the fallback category (only for categorized options)
  checkOptionFalbackInCategory = false
): SelectCategoryFocusDetails | null => {
  const currentFocusExists =
    isFocusedOptionIndexValid(focusedOptionIdx) && focusedCategory;
  return currentFocusExists
    ? getNextCategoryFocusDetailsInDirection(
        focusedOptionIdx!,
        focusedCategory,
        categorizedOptions,
        direction,
        fallbackDirection,
        checkOptionFalbackInCategory
      )
    : getFirstOptionAndCategory(categorizedOptions);
};

export const getFocusedOptionIdx = (
  focusedOptionIndex: number | null,
  selectOptions: SelectOptionList,
  direction: SelectKeyboardNavigationDirection,
  fallbackDirection: SelectFocusNavigationFallbackDirection
) => {
  return isFocusedOptionIndexValid(focusedOptionIndex)
    ? getNextFocusedOptionIdxInDirection(
        focusedOptionIndex!,
        selectOptions,
        direction,
        fallbackDirection
      )
    : 0;
};

export const getNextCategoryFocusDetailsInDirection = (
  focusedOptionIdx: number,
  focusedCategory: keyof SelectOptionT,
  categorizedOptions: CategorizedSelectOptions,
  direction: SelectKeyboardNavigationDirection,
  fallbackDirection: SelectFocusNavigationFallbackDirection,
  checkOptionsFalback?: boolean
): SelectCategoryFocusDetails | null => {
  const focusedCategoryOptions = categorizedOptions[focusedCategory];
  const categories = getObjectKeys(categorizedOptions);

  // 1. Try to get the next option in a category for the direction

  const nextCategoryOptionIdxInDirection = getNextOptionIdxInDirection(
    focusedOptionIdx,
    focusedCategoryOptions,
    direction
  );
  if (isFocusedOptionIndexValid(nextCategoryOptionIdxInDirection)) {
    return {
      focusedCategory,
      focusedOptionIdx: nextCategoryOptionIdxInDirection!,
    };
  }

  // 2. Try to get the next category in the direction

  const nextCategoryFocusDetailsInDirection =
    getNextCategoryAndOptionInDirection(
      categories,
      categorizedOptions,
      focusedCategory,
      direction
    );

  if (nextCategoryFocusDetailsInDirection)
    return nextCategoryFocusDetailsInDirection;

  // 3. If the next category is not found for the specified direction, and the fallback check for the options is provided try to get the category option in the fallback direction.
  if (checkOptionsFalback) {
    const categoryOptionFallbackIdx = getFallbackCategoryOptionIdx(
      focusedOptionIdx,
      focusedCategoryOptions,
      fallbackDirection as SelectKeyboardNavigationDirection
    );

    if (isFocusedOptionIndexValid(categoryOptionFallbackIdx)) {
      return {
        focusedCategory,
        focusedOptionIdx: categoryOptionFallbackIdx!,
      };
    }
  }

  // 4. Get the category in the fallback direction

  const fallbackCategoryFocusDetails = getFallbackFocusCategory(
    fallbackDirection,
    categories,
    categorizedOptions,
    focusedCategory,
    direction
  );

  return fallbackCategoryFocusDetails;
};

export const getNextFocusedOptionIdxInDirection = (
  focusedOptionIdx: number,
  selectOptions: SelectOptionList,
  direction: SelectKeyboardNavigationDirection,
  fallbackDirection: SelectFocusNavigationFallbackDirection
) => {
  const nextOptionIdxInDirection = getNextOptionIdxInDirection(
    focusedOptionIdx,
    selectOptions,
    direction
  );
  if (isFocusedOptionIndexValid(nextOptionIdxInDirection)) {
    return nextOptionIdxInDirection;
  }
  const fallbackOptionIdx = getFallbackFocusOptionIdx(
    fallbackDirection,
    focusedOptionIdx,
    selectOptions,
    direction
  );

  return fallbackOptionIdx;
};

export const getFirstOptionAndCategory = (
  categorizedSelectOptions: CategorizedSelectOptions
) => {
  const categories = getObjectKeys(categorizedSelectOptions);
  return {
    focusedCategory: categories[0],
    focusedOptionIdx: 0,
  };
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
    listClientHeight - optionOfsetTop > focusedOptionRect.height &&
    optionOfsetTop > 0
  );
};

export const isOptionListInViewPort = (
  listContainerRef: HTMLDivElement | null
) => {
  if (listContainerRef) {
    const listContainerRect = listContainerRef.getBoundingClientRect();
    const clientHeight = window.innerHeight;
    return clientHeight >= listContainerRect.bottom;
  }
};
export const scrollToTarget = (
  target: HTMLDivElement,
  options: ScrollIntoViewOptions = { behavior: "auto", block: "nearest" }
) => {
  if (!target) return;
  target.scrollIntoView(options);
};

export const resolveStateSetters = <T = void>(
  defaultStateSetterFunction: T extends void ? () => void : (arg: T) => void,
  customStateSetter?: T extends void ? () => void : StateSetter<T>,
  customStateSetterHandler?: T extends void ? () => void : (arg: T) => void
): T extends void ? () => void : (arg: T) => void => {
  if (isFunction(customStateSetter) && isFunction(customStateSetterHandler))
    return customStateSetterHandler;
  return defaultStateSetterFunction;
};

export const resolveClassNames = (
  defaultClass: string,
  customClass?: CustomClassName
) => {
  if (!customClass) {
    return defaultClass;
  }
  return customClass?.override
    ? customClass?.className
    : `${defaultClass} ${customClass?.className}`;
};

export const resolveRefs = <T>(
  defaultRef: RefObject<T>,
  customRef?: RefObject<T>
) => {
  return !isEmpty(customRef) ? customRef : defaultRef;
};

export const scrollToOptionList = (
  selectOptionListRef: HTMLDivElement,
  selectTopRef: HTMLDivElement
) => {
  if (selectOptionListRef) {
    const optionListElement = selectOptionListRef;
    const optionListElementHeight = optionListElement.clientHeight;
    const optionListRect = optionListElement.getBoundingClientRect();
    const selectContainerRect =
      optionListElement.parentElement?.getBoundingClientRect();
    const clientHeight = window.innerHeight;
    const spaceBottomAmount = window.innerHeight - optionListRect.bottom;
    const spaceTopAmount = selectContainerRect;

    const hasSpaceOnBottom = spaceBottomAmount >= clientHeight;
  }
};
