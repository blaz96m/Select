import {
  MutableRefObject,
  ReactNode,
  RefObject,
  Suspense,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  isEmpty,
  isFunction,
  isNull,
  isNumber,
  map,
  each,
  every,
  debounce,
} from "lodash";
import {
  SelectOptionList,
  SelectOptionT,
} from "src/Select/types/selectGeneralTypes";
import {
  SelectCategoryComponent,
  SelectOptionRenderer,
  SelectOptionListProps,
} from "src/Select/types/selectComponentTypes";
import { useScrollManager } from "src/general/hooks";
import clsx from "clsx";
import { OPTIONS_EMPTY_TEXT } from "src/Select/utils/constants";
import { useSelectContext } from ".";
import { resolveClassNames, resolveRefs } from "../utils";
import { getObjectKeys } from "src/utils/data-types/objects/helpers";

const OptionList = memo(
  forwardRef<HTMLDivElement, SelectOptionListProps>((props, ref) => {
    const { customComponentRenderer, ...otherProps } = props;
    const {
      isCategorized,
      isLoading,
      renderFunction,
      displayedOptions,
      handleScrollToBottom,
    } = otherProps;

    const selectContext = useSelectContext();

    const selectPositionStyle = {};

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

    const bottomScrollActions = { onArrive: handleScrollToBottom };

    useImperativeHandle(ref, () => resolvedRef.current!);
    useScrollManager<HTMLDivElement>(
      resolvedRef,
      bottomScrollActions,
      {},
      isLoading
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
                  categoryOptions: value as SelectOptionList,
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

export default OptionList;
