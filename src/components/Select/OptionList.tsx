import {
  MutableRefObject,
  ReactNode,
  RefObject,
  forwardRef,
  memo,
  useImperativeHandle,
  useRef,
} from "react";
import { isEmpty, isFunction, isNull, isNumber, map, each } from "lodash";
import {
  CategorizedSelectOptions,
  SelectOptionList,
  SelectOptionT,
  SelectCategoryRenderer,
  SelectOptionRenderer,
} from "./types";
import { useScrollManager } from "src/hooks/dom";
import clsx from "clsx";
import { OPTIONS_EMPTY_TEXT } from "src/utils/select/constants";

export type OptionListProps = {
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  renderFunction: SelectCategoryRenderer | SelectOptionRenderer;
  handlePageChange: () => void;
  categoryKey: string;
  page: number;
  isCategorized?: boolean;
  isLoading?: boolean;
  hasPaging?: boolean;
  customOnScrollToBottom?: (
    page: number,
    options: SelectOptionList | CategorizedSelectOptions
  ) => void;
  onPageChange?: (page: number) => void;
};

const OptionList = memo(
  forwardRef<HTMLDivElement, OptionListProps>(
    (
      {
        renderFunction,
        displayedOptions,
        handlePageChange,
        isCategorized,
        categoryKey,
        hasPaging,
        page,
        customOnScrollToBottom,
        onPageChange,
        isLoading,
      },
      ref
    ) => {
      const hasCategories = categoryKey && isCategorized;

      const onScrollToBottom = () => {
        if (isFunction(customOnScrollToBottom))
          return customOnScrollToBottom(page, displayedOptions);

        if (hasPaging) {
          const nextPage = page++;
          handlePageChange();
          isFunction(onPageChange) && onPageChange(nextPage);
        }
      };

      const bottomScrollActions = { onArrive: onScrollToBottom };
      const innerRef = useRef<HTMLDivElement>(null);
      useImperativeHandle(ref, () => innerRef.current!);
      useScrollManager<HTMLDivElement>(
        innerRef,
        bottomScrollActions,
        {},
        !isLoading
      );

      return (
        <div className="select__options__wrapper" ref={innerRef}>
          <ul
            className={clsx({
              select__options__list: true,
              "select__options__list--empty": isEmpty(displayedOptions),
            })}
          >
            {!isEmpty(displayedOptions) ? (
              map(displayedOptions, (value, key: number | string) => {
                if (hasCategories) {
                  return (renderFunction as SelectCategoryRenderer)({
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
    }
  )
);

export default OptionList;
