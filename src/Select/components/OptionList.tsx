import {
  MutableRefObject,
  ReactNode,
  RefObject,
  forwardRef,
  memo,
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
import { resolveClassNames } from "../utils";
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

    const {
      components: { SelectOptionListElement: customComponent },
      classNames: {
        selectOptionList: customOptionListClass,
        selectOptionListEmpty: customEmptyClass,
        selectOptionListWrapper: customContainerClass,
      },
    } = selectContext;

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

    const bottomScrollActions = { onArrive: handleScrollToBottom };
    const innerRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => innerRef.current!);
    useScrollManager<HTMLDivElement>(
      innerRef,
      bottomScrollActions,
      {},
      !isLoading
    );

    if (isFunction(customComponent)) {
      const props = {
        ...otherProps,
        wrapperClassName,
        listClassName,
        ref: innerRef,
      };
      return customComponentRenderer(props, customComponent);
    }

    return (
      <div className={wrapperClassName} ref={innerRef}>
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
          ) : (
            <div>{OPTIONS_EMPTY_TEXT}</div>
          )}
        </ul>
      </div>
    );
  })
);

export default OptionList;
