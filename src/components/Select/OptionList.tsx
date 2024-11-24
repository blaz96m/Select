import {
  MutableRefObject,
  ReactNode,
  RefObject,
  forwardRef,
  memo,
  useImperativeHandle,
  useRef,
} from "react";
import { isNull, isNumber, map } from "lodash";
import {
  CategorizedSelectOptions,
  SelectOptionList,
  SelectOptionT,
  selectRendererOverload,
} from "./types";
import { useScrollManager } from "src/hooks/dom";

export type OptionListProps = {
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  renderFn: selectRendererOverload;
  handlePageChange: () => void;
  isCategorized: boolean;
  categoryKey: string;
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
      },
      ref
    ) => {
      const hasCategories = categoryKey && isCategorized;
      const bottomScrollActions = { onArrive: handlePageChange };
      const innerRef = useRef<HTMLDivElement>(null);
      // TODO - Check if imperative handles are required across the proj.
      useImperativeHandle(ref, () => innerRef.current!);
      useScrollManager<HTMLDivElement>(innerRef, bottomScrollActions, {}, true);
      return (
        <div className="select__options__wrapper" ref={innerRef}>
          <ul className="select__options__list">
            {map(displayedOptions, (value, key) => {
              if (hasCategories) {
                return renderFn({
                  categoryName: key,
                  categoryOptions: value as SelectOptionList,
                });
              }
              return renderFn(value as SelectOptionT);
            })}
          </ul>
        </div>
      );
    }
  )
);

export default OptionList;
