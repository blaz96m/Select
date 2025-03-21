import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  RefObject,
  useCallback,
} from "react";
import {
  SelectClearIndicatorInnerProps,
  CustomOptionListComponent,
  CustomSelectOptionListProps,
  CustomSelectCategoryComponent,
  CustomSelectCategoryProps,
  CustomSelectClearIndicatorComponent,
  CustomSelectClearIndicatorProps,
  CustomSelectDropdownIndicatorComponent,
  CustomSelectInputComponent,
  CustomSelectMultiValueComponent,
  CustomSelectMultiValueProps,
  CustomSelectMultiValueRenderer,
  CustomSelectOptionComponent,
  SelectMultiValueInnerProps,
  SelectOptionListInnerProps,
  SelectOptionListProps,
  SelectCategoryInnerProps,
  SelectCategoryProps,
  SelectClearIndicatorProps,
  SelectDropdownIndicatorProps,
  SelectInputProps,
  SelectMultiValueProps,
  SelectOptionProps,
  CustomSelectOptionComponentProps,
  CustomSelectInputComponentProps,
} from "src/Select/types/selectComponentTypes";
import {
  SelectEventHandlers,
  SelectOptionT,
} from "src/Select/types/selectGeneralTypes";
import { SelectApi, SelectAsyncApi } from "src/Select/types/selectStateTypes";
import { FALLBACK_CATEGORY_NAME } from "src/Select/utils/constants";

type SelectProps = {
  categoryKey?: keyof SelectOptionT;
  isCategorized: boolean;
  fetchOnScrollToBottom: boolean | undefined;
  clearInputOnIdicatorClick: boolean;
  isMultiValue: boolean;
  clearValueOnInputChange: boolean;
};

const useSelectCustomComponentsHandler = (
  selectApi: SelectApi,
  selectAsyncApi: SelectAsyncApi,
  selectEventHandlers: SelectEventHandlers,
  selectProps: SelectProps
) => {
  const {
    usesInputAsync,
    filterSearchedOptions,
    selectState,
    selectFocusState,
    selectFocusHandlers,
    displayedOptions,
    selectEventHandlers: selectDefaultEventHandlers,
    selectStateUpdaters,
    focusInput,
    isLastPage,
    getSelectOptionsMap,
    onOptionSelect,
    clearInputOnSelect,
    selectDomRefs,
    getOriginalOptions,
  } = selectApi;

  const { isLastPage: isLastPageAsync } = selectAsyncApi;

  const { selectOptions, value, page, inputValue } = selectState;

  const { focusedOptionCategory, focusedOptionIndex } = selectFocusState;

  const {
    openDropdown,
    closeDropdown,
    clearAllValues,
    clearValue,
    setValue,
    clearInput,
    setSelectOptions,
    setInputValue,
  } = selectStateUpdaters;

  const {
    categoryKey,
    isCategorized,
    fetchOnScrollToBottom,
    clearInputOnIdicatorClick,
    isMultiValue,
    clearValueOnInputChange,
  } = selectProps;

  const { handleInputChange, handlePageChange } = selectEventHandlers;

  const { handleValueSelectOnKeyPress } = selectDefaultEventHandlers;

  const { focusNextOption, focusPreviousOption, resetFocus } =
    selectFocusHandlers;

  const handleCustomInputRender = useCallback(
    (
      selectInputProps: Omit<SelectInputProps, "customComponentRenderer"> & {
        className: string;
        containerClassName: string;
        ref: RefObject<HTMLInputElement>;
      },
      customComponent: CustomSelectInputComponent
    ) => {
      const { selectListContainerRef } = selectDomRefs;
      const customInputComponentProps: CustomSelectInputComponentProps = {
        ...selectInputProps,
        filterSearchedOptions,
        selectOptions,
        displayedOptions,
        handleValueSelectOnKeyPress,
        focusedOptionIndex,
        setSelectOptions,
        getOriginalOptions,
        setInputValue,
        handleInputChange,
        selectOptionListRef: selectListContainerRef,
        focusedOptionCategory,
        focusPreviousOption,
        focusNextOption,
        openDropdown,
        value,
        closeDropdown,
        clearAllValues,
      };

      const {
        inputValue,
        isLoading,
        handleKeyPress,
        onInputChange,
        containerClassName,
        ref,
        className,
      } = selectInputProps;

      const customInputComponentInnerProps = {
        onChange: (e: ChangeEvent<HTMLInputElement>) => onInputChange(e),
        onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => handleKeyPress(e),
        containerClassName,
        disabled: isLoading,
        value: inputValue,
        ref,
        className,
      };

      return customComponent(
        customInputComponentProps,
        customInputComponentInnerProps
      );
    },
    [
      usesInputAsync,
      filterSearchedOptions,
      selectOptions,
      handleValueSelectOnKeyPress,
      handleInputChange,
    ]
  );

  const handleCustomOptionRender = useCallback(
    (
      selectOptionProps: Omit<SelectOptionProps, "customComponentRenderer"> & {
        className: string;
        refCallback: (node: HTMLDivElement) => void;
      },
      customComponent: CustomSelectOptionComponent
    ) => {
      const { className, onClick, refCallback, handleHover, ...otherProps } =
        selectOptionProps;

      const { option, isSelected, optionIndex, isFocused, isDisabled } =
        otherProps;

      const customProps: CustomSelectOptionComponentProps = {
        ...otherProps,
        onOptionSelect,
        getSelectOptionsMap,
        value,
        isMultiValue,
        setValue,
        clearInput,
        focusInput,
        clearInputOnSelect,
        closeDropdown,
        resetFocus,
      };

      const innerProps = {
        ref: refCallback,
        id: String(option.id),
        onClick: () => onClick(option, isSelected, isDisabled),
        className,
        "data-selected": isSelected,
        "data-category": isCategorized
          ? option[categoryKey!] || FALLBACK_CATEGORY_NAME
          : "",
        key: option.id,
        onMouseMove: (e: MouseEvent<HTMLDivElement>) =>
          handleHover(e, isFocused, optionIndex),
      };

      return customComponent(customProps, innerProps);
    },
    [onOptionSelect, categoryKey, isCategorized]
  );

  const handleCustomOptionListRender = useCallback(
    (
      selectOptionListProps: Omit<
        SelectOptionListProps,
        "customComponentRenderer"
      > & {
        listClassName: string;
        wrapperClassName: string;
        ref: RefObject<HTMLDivElement>;
      },
      customComponent: CustomOptionListComponent
    ) => {
      const resolvedIsLastPage = useCallback(
        () => (fetchOnScrollToBottom ? isLastPageAsync() : isLastPage()),
        [isLastPageAsync, isLastPage, fetchOnScrollToBottom]
      );

      const { listClassName, wrapperClassName, ref, ...otherProps } =
        selectOptionListProps;

      const props: CustomSelectOptionListProps = {
        ...otherProps,
        handlePageChange,
        isLastPage: resolvedIsLastPage,
        page,
        fetchOnScrollToBottom,
      };

      const innerProps: SelectOptionListInnerProps = {
        listClassName,
        wrapperClassName,
        ref,
      };

      return customComponent(props, innerProps);
    },
    [isLastPage, isLastPageAsync, fetchOnScrollToBottom]
  );

  const handleCustomCategoryRender = useCallback(
    (
      selectOptionCategoryProps: Omit<
        SelectCategoryProps,
        "customComponentRenderer"
      > & {
        categoryHeaderClassName: string;
        categoryListClassName: string;
      },
      customComponent: CustomSelectCategoryComponent
    ) => {
      const { categoryHeaderClassName, categoryListClassName } =
        selectOptionCategoryProps;

      const customProps: CustomSelectCategoryProps = {
        ...selectOptionCategoryProps,
        value,
      };

      const innerProps: SelectCategoryInnerProps = {
        categoryHeaderClassName,
        categoryListClassName,
      };

      return customComponent(customProps, innerProps);
    },
    [value]
  );

  const handleCustomMultiValueRenderer: CustomSelectMultiValueRenderer =
    useCallback(
      (
        selectMultiValueProps: Omit<
          SelectMultiValueProps,
          "customComponentRenderer"
        > & {
          className: string;
          iconContainerClassName: string;
          iconClassName: string;
        },
        customComponent: CustomSelectMultiValueComponent
      ) => {
        const {
          className,
          iconClassName,
          iconContainerClassName,
          labelKey,
          value,
          handleValueClear,
          valueList,
        } = selectMultiValueProps;
        const label = value[labelKey];

        const innerProps: SelectMultiValueInnerProps = {
          className,
          iconClassName,
          iconContainerClassName,
          onClick: (e: MouseEvent<HTMLDivElement>) =>
            handleValueClear(e, value),
        };

        const customProps: CustomSelectMultiValueProps = {
          clearInput,
          clearValue,
          focusInput,
          label,
          handleValueClear,
          labelKey,
          value,
          valueList,
        };

        return customComponent(customProps, innerProps);
      },
      [clearValue]
    );

  const handleCustomDrodpownIndicatorRender = useCallback(
    (
      selectDropdownIndicatorProps: Omit<
        SelectDropdownIndicatorProps,
        "customComponentRenderer"
      > & {
        className: string;
      },
      customComponent: CustomSelectDropdownIndicatorComponent
    ) =>
      customComponent(selectDropdownIndicatorProps, {
        className: selectDropdownIndicatorProps.className,
      }),
    []
  );

  const handleCustomClearIndicatorRender = useCallback(
    (
      selectClearIndicatorProps: Omit<
        SelectClearIndicatorProps,
        "customComponentRenderer"
      > & { className: string },
      customComponent: CustomSelectClearIndicatorComponent
    ) => {
      const { className, isLoading, handleClearIndicatorClick } =
        selectClearIndicatorProps;
      const props: CustomSelectClearIndicatorProps = {
        inputValue,
        isLoading,
        clearInputOnIdicatorClick,
        clearValueOnInputChange,
        value,
      };
      const innerProps: SelectClearIndicatorInnerProps = {
        className,
        onClick: handleClearIndicatorClick,
      };

      return customComponent(props, innerProps);
    },
    [value, inputValue, clearInputOnIdicatorClick]
  );

  return {
    handleCustomInputRender,
    handleCustomOptionRender,
    handleCustomOptionListRender,
    handleCustomCategoryRender,
    handleCustomMultiValueRenderer,
    handleCustomDrodpownIndicatorRender,
    handleCustomClearIndicatorRender,
  };
};

export default useSelectCustomComponentsHandler;
