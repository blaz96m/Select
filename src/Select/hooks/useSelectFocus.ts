import { isEmpty, isNumber, isObject } from "lodash-es";
import { MouseEvent, RefObject, useCallback, useState } from "react";
import {
  CategorizedSelectOptions,
  SelectFocusNavigationFallbackDirection,
  SelectKeyboardNavigationDirection,
  SelectOptionList,
  SelectOptionT,
  SelectCategoryFocusDetails,
} from "src/Select/types/selectGeneralTypes";
import { SelectFocusApi } from "src/Select/types/selectStateTypes";
import { getObjectKeys } from "src/utils/data-types/objects/helpers";
import {
  getCategoryFocusDetails,
  getFocusedOptionIdx,
  isFocusedOptionInViewport,
  scrollToTarget,
  isFocusedOptionIndexValid,
} from "src/Select/utils";

type SelectProps = {
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  isCategorized?: boolean;
  categoryKey?: string;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  selectListContainerRef: RefObject<HTMLDivElement>;
  removeSelectedOptionsFromList: boolean;
};

const useSelectFocus = (selectProps: SelectProps): SelectFocusApi => {
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number | null>(
    0
  );
  const [focusedOptionCategory, setFocusedOptionCategory] =
    useState<keyof SelectOptionT>("");

  const {
    displayedOptions,
    isCategorized,
    categoryKey,
    getSelectOptionsMap,
    selectListContainerRef,
    removeSelectedOptionsFromList,
  } = selectProps;

  const handleScrollToFocusedOption = useCallback((optionId: string) => {
    const listContainer = selectListContainerRef.current;
    const selectOptionMap = getSelectOptionsMap();
    const selectOptionNode = selectOptionMap.get(optionId)!;
    if (listContainer) {
      if (!isFocusedOptionInViewport(listContainer, selectOptionNode)) {
        scrollToTarget(selectOptionNode);
      }
    }
  }, []);

  const setCategoryFocusDetails = (
    focusDetails: SelectCategoryFocusDetails | null
  ) => {
    if (!focusDetails) {
      setFocusedOptionIndex(null);
      setFocusedOptionCategory("");
      return;
    }
    const { focusedOptionIdx, focusedCategory } = focusDetails;
    setFocusedOptionIndex(focusedOptionIdx);
    setFocusedOptionCategory(focusedCategory);
  };

  const onAfterFocusChange = useCallback(
    (
      focusDetails: SelectCategoryFocusDetails | number | null,
      scrollToFocusedOption = true
    ) => {
      if (
        focusDetails ||
        (isNumber(focusDetails) && isFocusedOptionIndexValid(focusDetails))
      ) {
        let focusedOptionId;
        if (isObject(focusDetails)) {
          const { focusedCategory, focusedOptionIdx } = focusDetails;
          const focusedOption = (displayedOptions as CategorizedSelectOptions)[
            focusedCategory
          ][focusedOptionIdx];
          focusedOptionId = focusedOption.id;
        } else {
          focusedOptionId = (displayedOptions as SelectOptionList)[focusDetails]
            .id;
        }
        scrollToFocusedOption &&
          handleScrollToFocusedOption(String(focusedOptionId));
      }
    },
    [displayedOptions]
  );

  const handleOptionFocusChange = useCallback(
    (
      direction: SelectKeyboardNavigationDirection,
      focusedOptionIndex: number | null,
      focusedOptionCategory: keyof SelectOptionT,
      fallbackDirection: SelectFocusNavigationFallbackDirection = "opposite",
      // Check if an option exists in the fallback direction provided before checking for the fallback category (only for categorized options)
      checkOptionFalbackInCategory = false,
      scrollToFocusedOption = true
    ) => {
      if (!isEmpty(displayedOptions)) {
        let focusDetails: SelectCategoryFocusDetails | number | null;
        if (isCategorized) {
          focusDetails = getCategoryFocusDetails(
            focusedOptionIndex,
            focusedOptionCategory,
            displayedOptions as CategorizedSelectOptions,
            direction,
            fallbackDirection,
            checkOptionFalbackInCategory
          );
          setCategoryFocusDetails(focusDetails);
        } else {
          focusDetails = getFocusedOptionIdx(
            focusedOptionIndex,
            displayedOptions as SelectOptionList,
            direction,
            fallbackDirection
          );
          setFocusedOptionIndex(focusDetails);
        }
        onAfterFocusChange(focusDetails, scrollToFocusedOption);
      }
    },
    [onAfterFocusChange, isCategorized]
  );

  const focusNextOption = useCallback(
    (fallbackDirection: SelectFocusNavigationFallbackDirection = "opposite") =>
      handleOptionFocusChange(
        "next",
        focusedOptionIndex,
        focusedOptionCategory,
        fallbackDirection
      ),
    [handleOptionFocusChange, focusedOptionIndex, focusedOptionCategory]
  );

  const focusPreviousOption = useCallback(
    () =>
      handleOptionFocusChange(
        "previous",
        focusedOptionIndex,
        focusedOptionCategory
      ),

    [handleOptionFocusChange, focusedOptionIndex, focusedOptionCategory]
  );

  const isLastOptionInList = () => {
    if (isCategorized) {
      const categorizedOptions = displayedOptions as CategorizedSelectOptions;
      const categories = getObjectKeys(categorizedOptions);
      const categoryOptionsLength =
        categorizedOptions[focusedOptionCategory].length;
      return categories.length === 1 && categoryOptionsLength === 1;
    }
    return displayedOptions.length === 1;
  };

  const isLastOptionFocused = () => {
    if (isCategorized) {
      const categorizedOptions = displayedOptions as CategorizedSelectOptions;
      const categoryOptions = categorizedOptions[focusedOptionCategory];
      return categoryOptions.length - 1 === focusedOptionIndex;
    }
    const listOptions = displayedOptions as SelectOptionList;
    return listOptions.length - 1 === focusedOptionIndex;
  };

  const handleOptionFocusOnSelectByKeyPress = useCallback(
    (
      direction: SelectKeyboardNavigationDirection = "next",
      fallbackDirection: SelectFocusNavigationFallbackDirection = "previous"
    ) => {
      if (
        isLastOptionInList() ||
        (removeSelectedOptionsFromList && !isLastOptionFocused())
      ) {
        return;
      }

      handleOptionFocusChange(
        direction,
        focusedOptionIndex,
        focusedOptionCategory,
        fallbackDirection,
        true,
        false
      );
    },
    [handleOptionFocusChange, focusedOptionIndex, focusedOptionCategory]
  );

  const setFocusOnHover = useCallback(
    (optionIdx: number, optionCategory: string) => {
      setFocusedOptionIndex(optionIdx);
      isCategorized && setFocusedOptionCategory(optionCategory);
    },
    [isCategorized]
  );

  const resetFocus = useCallback(() => {
    if (isEmpty(displayedOptions)) return;
    if (isCategorized) {
      const categories = getObjectKeys(displayedOptions);
      setFocusedOptionCategory(categories[0]);
    }
    setFocusedOptionIndex(0);
  }, [isCategorized, displayedOptions]);

  const isOptionFocused = useCallback(
    (option: SelectOptionT, optionIdx: number) => {
      if (isCategorized) {
        const optionCategory = option[categoryKey!];
        return (
          optionCategory === focusedOptionCategory &&
          optionIdx === focusedOptionIndex
        );
      }
      return optionIdx === focusedOptionIndex;
    },
    [
      focusedOptionIndex,
      focusedOptionCategory,
      displayedOptions,
      isCategorized,
      categoryKey,
    ]
  );

  const getFocusedOption = useCallback(() => {
    if (focusedOptionIndex) {
      if (isCategorized && focusedOptionCategory) {
        const categorizedOptions = displayedOptions as CategorizedSelectOptions;
        return categorizedOptions[focusedOptionCategory][focusedOptionIndex];
      }
      return (displayedOptions as SelectOptionList)[focusedOptionIndex];
    }
  }, [displayedOptions, focusedOptionCategory, focusedOptionIndex]);

  const handleOptionHover = useCallback(
    (
      e: MouseEvent<HTMLDivElement>,
      isFocused: boolean,
      optionIndex: number
    ) => {
      if (isFocused) {
        return;
      }
      const optionCategory = isCategorized
        ? e.currentTarget.dataset?.category
        : "";
      setFocusOnHover(optionIndex, optionCategory!);
    },
    [isCategorized]
  );

  return {
    selectFocusState: { focusedOptionCategory, focusedOptionIndex },
    selectFocusHandlers: {
      focusNextOption,
      focusPreviousOption,
      handleOptionFocusOnSelectByKeyPress,
      setFocusOnHover,
      setFocusedOptionIndex,
      setFocusedOptionCategory,
      resetFocus,
      isOptionFocused,
      handleOptionHover,
      getFocusedOption,
    },
  };
};

export default useSelectFocus;
