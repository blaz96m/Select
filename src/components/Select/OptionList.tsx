import {
  MutableRefObject,
  ReactNode,
  RefObject,
  forwardRef,
  memo,
  useImperativeHandle,
  useRef,
} from "react";
import { isEmpty, isFunction, isNull, isNumber, map } from "lodash";
import {
  CategorizedSelectOptions,
  SelectOptionList,
  SelectOptionT,
  selectRendererOverload,
} from "./types";
import { useScrollManager } from "src/hooks/dom";
import clsx from "clsx";
import { SelectAsyncStateSetters } from "src/hooks/select/useSelectAsync";
import { OPTIONS_EMPTY_TEXT } from "src/utils/select/constants";

export type OptionListProps = {
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  renderFn: selectRendererOverload;
  handlePageChange: () => void;
  isCategorized: boolean;
  categoryKey: string;
  getSelectAsyncStateSetters: () => SelectAsyncStateSetters;
  page: number;
  customOnScrollToBottom?: (
    page: number,
    options: SelectOptionList | CategorizedSelectOptions
  ) => void;
  onPageChange?: (page: number) => void;
  useDataPartitioning?: boolean;
  fetchOnScrollToBottom?: boolean;
};

const OptionList = memo(
  forwardRef<HTMLDivElement, OptionListProps>(
    (
      {
        renderFn,
        displayedOptions,
        handlePageChange,
        isCategorized,
        categoryKey,
        fetchOnScrollToBottom,
        useDataPartitioning,
        page,
        getSelectAsyncStateSetters,
        customOnScrollToBottom,
        onPageChange,
      },
      ref
    ) => {
      const hasCategories = categoryKey && isCategorized;
      const onScrollToBottom = () => {
        if (isFunction(customOnScrollToBottom))
          return customOnScrollToBottom(page, displayedOptions);

        const selectAsyncStateSetters = getSelectAsyncStateSetters();

        if (fetchOnScrollToBottom || useDataPartitioning) {
          const nextPage = page++;
          fetchOnScrollToBottom
            ? selectAsyncStateSetters.goToNextPage()
            : handlePageChange();
          isFunction(onPageChange) && onPageChange(nextPage);
        }
      };

      const bottomScrollActions = { onArrive: onScrollToBottom };
      const innerRef = useRef<HTMLDivElement>(null);
      // TODO - Check if imperative handles are required across the proj.
      useImperativeHandle(ref, () => innerRef.current!);
      useScrollManager<HTMLDivElement>(innerRef, bottomScrollActions, {}, true);

      return (
        <div className="select__options__wrapper" ref={innerRef}>
          <ul
            className={clsx({
              select__options__list: true,
              "select__options__list--empty": isEmpty(displayedOptions),
            })}
          >
            {!isEmpty(displayedOptions) ? (
              map(displayedOptions, (value, key) => {
                if (hasCategories) {
                  return renderFn({
                    categoryName: key,
                    categoryOptions: value as SelectOptionList,
                  });
                }
                return renderFn(value as SelectOptionT);
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
