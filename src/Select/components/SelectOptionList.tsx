import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { isEmpty, isFunction, map } from "lodash-es";
import {
  SelectOptionList as SelectOptionListT,
  SelectOptionT,
} from "src/Select/types/selectGeneralTypes";
import {
  SelectCategoryComponent,
  SelectOptionRenderer,
  SelectOptionListProps,
} from "src/Select/types/selectComponentTypes";
import { useOutsideClickHandler, useScrollManager } from "src/general/hooks";
import clsx from "clsx";
import { OPTIONS_EMPTY_TEXT } from "src/Select/utils/constants";
import { useSelectContext } from "src/Select/context";
import { resolveClassNames, resolveRefs } from "../utils";

const SelectOptionList = memo(
  forwardRef<HTMLDivElement, SelectOptionListProps>((props, ref) => {
    const { customComponentRenderer, ...otherProps } = props;
    const {
      isCategorized,
      isLoading,
      renderFunction,
      displayedOptions,
      selectTopRef,
      disableCloseOnOutsideClick,
      handleScrollToBottom,
      closeDropdown,
      isLastPage,
    } = otherProps;

    const selectContext = useSelectContext();

    const {
      components: { SelectOptionListElement: customComponent },
      classNames: {
        selectOptionList: customOptionListClass,
        selectOptionListEmpty: customEmptyClass,
        selectOptionListWrapper: customContainerClass,
      },
      refs: { optionListRef: customOptionListRef },
    } = selectContext;

    const innerRef = useRef<HTMLDivElement>(null);
    const resolvedRef = resolveRefs(innerRef, customOptionListRef);

    const optionListClassName = resolveClassNames(
      "select__options__list",
      customOptionListClass
    );
    const emptyListClassName = resolveClassNames(
      "select__options__list--empty",
      customEmptyClass
    );

    const listClassName = clsx({
      [optionListClassName]: true,
      [emptyListClassName]: isEmpty(displayedOptions),
    });

    const wrapperClassName = resolveClassNames(
      "select__options__wrapper",
      customContainerClass
    );

    const wrapperClassNames = clsx({
      [wrapperClassName]: true,
      "select__options__wrapper--empty": isEmpty(displayedOptions),
    });

    const preventScroll = isLoading;

    const bottomScrollActions = {
      onArrive: { handler: handleScrollToBottom, prevent: isLastPage },
    };

    const handleOutsideClick = useCallback((e: MouseEvent) => {
      const target = e.target as Node;
      // @ts-ignore
      const targetIsOption = target.hasAttribute("data-selected");
      if (!selectTopRef.current?.contains(target) && !targetIsOption) {
        closeDropdown();
      }
    }, []);

    useImperativeHandle(ref, () => resolvedRef.current!);
    useOutsideClickHandler<HTMLDivElement>(
      resolvedRef,
      handleOutsideClick,
      disableCloseOnOutsideClick
    );
    useScrollManager<HTMLDivElement>(
      resolvedRef,
      bottomScrollActions,
      {},
      preventScroll
    );

    if (isFunction(customComponent)) {
      const props = {
        ...otherProps,
        wrapperClassName,
        listClassName,
        ref: resolvedRef,
      };
      return customComponentRenderer(props, customComponent);
    }

    return (
      <div
        data-testid="select-option-list"
        className={wrapperClassNames}
        ref={resolvedRef}
      >
        <ul className={listClassName}>
          {!isEmpty(displayedOptions) ? (
            map(displayedOptions, (value, key: number | string) => {
              if (isCategorized) {
                return (renderFunction as SelectCategoryComponent)({
                  categoryName: key as string,
                  categoryOptions: value as SelectOptionListT,
                });
              }
              return (renderFunction as SelectOptionRenderer)(
                value as SelectOptionT,
                key as number
              );
            })
          ) : isLoading ? (
            <div>Loading...</div>
          ) : (
            <div>{OPTIONS_EMPTY_TEXT}</div>
          )}
        </ul>
      </div>
    );
  })
);

export default SelectOptionList;
