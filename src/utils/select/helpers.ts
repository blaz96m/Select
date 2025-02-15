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
  SelectState,
  CategorizedSelectOptions,
  SelectOptionT,
  SelectKeyboardNavigationDirection,
  SelectComponents,
  SelectOptionInnerProps,
  SelectOptionComponentHandlers,
  SelectInputComponentHandlers,
  SelectInputInnerProps,
  SelectComponentHandlers,
  CustomClass,
  SelectFocusNavigationFallbackDirection,
  SelectCategoryFocusDetails,
  StateSetter,
} from "src/components/Select/types";
import { getObjectKeys } from "../data-types/objects/helpers";
import { FALLBACK_CATEGORY_NAME, INITIAL_STATE } from "./constants";

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

export const filterDataBySelectedValues = (
  options: SelectOptionList | CategorizedSelectOptions,
  value: SelectOptionList,
  categoryKey: keyof SelectOptionT | string
) => {
  if (isEmpty(value)) {
    return options;
  }
  if (!isEmpty(categoryKey)) {
    const categories = cloneDeep(options as CategorizedSelectOptions);
    return filterCategoriesBySelectedValues(categories, value, categoryKey);
  }
  return filterListBySelectedValues(options as SelectOptionList, value);
};

export const filterListBySelectedValues = (
  options: SelectOptionList,
  value: SelectOptionList
): SelectOptionList => {
  const valueIds = map(value, (val) => val.id);
  return filter(options, (option) => !includes(valueIds, option.id));
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
  focusedOptions: SelectOptionT[],
  direction: SelectKeyboardNavigationDirection
) => {
  const nextIdxInDirection = getNextIdxInDirection(direction, focusedOptionIdx);
  const nextOptionInDirection = focusedOptions[nextIdxInDirection];
  return nextOptionInDirection ? nextIdxInDirection : null;
};

const getOppositeDirectionOptionIdx = (
  selectOptions: SelectOptionList,
  direction: SelectKeyboardNavigationDirection
) => (direction === "down" ? 0 : selectOptions.length - 1);

const getPreviousOptionIdx = (focusedOptionIdx: number) => focusedOptionIdx - 1;

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
    direction === "down" ? first(categories) : last(categories);
  const targetOptionIdx = getFocusedOptionIdxOnCategoryChange(
    direction,
    categorizedOptions[targetCategory!]
  );
  return {
    focusedCategory: targetCategory!,
    focusedOptionIdx: targetOptionIdx,
  };
};

const getFallbackOptionIdx = (
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
  }
};

const getFallbackCategory = (
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
        "up"
      );
  }
};

const getNextIdxInDirection = (
  direction: SelectKeyboardNavigationDirection,
  currItemIdx: number
) => (direction === "down" ? currItemIdx + 1 : currItemIdx - 1);

const getFocusedOptionIdxOnCategoryChange = (
  direction: SelectKeyboardNavigationDirection,
  categoryOptions: SelectOptionT[]
) => (direction === "down" ? 0 : categoryOptions.length - 1);

export const getCategoryFocusDetails = (
  focusedOptionIdx: number | null,
  focusedCategory: keyof SelectOptionT,
  categorizedOptions: CategorizedSelectOptions,
  direction: SelectKeyboardNavigationDirection,
  fallbackDirection: SelectFocusNavigationFallbackDirection
): SelectCategoryFocusDetails | null => {
  const currentFocusExists =
    isFocusedOptionIndexValid(focusedOptionIdx) && focusedCategory;
  return currentFocusExists
    ? getNextCategoryFocusDetailsInDirection(
        focusedOptionIdx!,
        focusedCategory,
        categorizedOptions,
        direction,
        fallbackDirection
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
  fallbackDirection: SelectFocusNavigationFallbackDirection
): SelectCategoryFocusDetails | null => {
  // 1. Try to get the next option in a category
  const focusedCategoryOptions = categorizedOptions[focusedCategory];
  const categories = getObjectKeys(categorizedOptions);

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
  // 2. Try to get the next category
  const nextCategoryFocusDetailsInDirection =
    getNextCategoryAndOptionInDirection(
      categories,
      categorizedOptions,
      focusedCategory,
      direction
    );

  if (nextCategoryFocusDetailsInDirection)
    return nextCategoryFocusDetailsInDirection;
  // 3. Get the fallback option and category
  const fallbackCategoryFocusDetails = getFallbackCategory(
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
  const fallbackOptionIdx = getFallbackOptionIdx(
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

export const resolveStateValue = <T>(
  defaultStateValue: T,
  customStateValue: T | undefined | null
): T => (!isNil(customStateValue) ? customStateValue : defaultStateValue);

export const scrollToTarget = (
  target: HTMLDivElement,
  options: ScrollIntoViewOptions = { behavior: "smooth", block: "center" }
) => {
  if (!target) return;
  target.scrollIntoView(options);
};

export const resolveStateSetters = <T = void>(
  defaultStateSetterFunction: T extends void ? () => void : (arg: T) => void,
  customStateSetter?: T extends void ? () => void : StateSetter<T>
): T extends void ? () => void : (arg: T) => void => {
  if (isFunction(customStateSetter)) return customStateSetter;
  return defaultStateSetterFunction;
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
