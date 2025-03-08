import { first, head, isEmpty, isNull, isNumber, isObject, last } from "lodash";
import { Ref, RefObject, useCallback, useState } from "react";
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
  isCategorized: boolean;
  categoryKey?: string;
  getSelectOptionsMap: () => Map<string, HTMLDivElement>;
  selectListContainerRef: RefObject<HTMLDivElement>;
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
        onFocusChange(focusDetails, scrollToFocusedOption);
      }
    },
    [displayedOptions, isCategorized]
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

  const handleOptionFocusOnSelectByKeyPress = useCallback(
    (
      direction: SelectKeyboardNavigationDirection = "next",
      fallbackDirection: SelectFocusNavigationFallbackDirection = "previous"
    ) => {
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

  const onFocusChange = useCallback(
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
        scrollToFocusedOption && handleScrollToFocusedOption(focusedOptionId);
      }
    },
    [displayedOptions]
  );

  const handleOptionHover = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement, MouseEvent>,
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
