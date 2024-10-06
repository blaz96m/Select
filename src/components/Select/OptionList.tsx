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
} from "./types";
import { useScrollManager } from "src/hooks/dom";

export type OptionListProps = {
  loadNextPage: () => void;
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  renderOption: (option: SelectOptionT) => React.JSX.Element;
  page: number;
  recordsPerPage?: number;
  totalRecords?: number;
};

const OptionList = memo(
  forwardRef<HTMLDivElement, OptionListProps>(
    (
      {
        renderOption,
        displayedOptions,
        loadNextPage,
        page,
        recordsPerPage,
        totalRecords,
      },
      ref
    ) => {
      const handlePageChange = () => {
        if (totalRecords && recordsPerPage) {
          if (page * recordsPerPage < totalRecords) {
            loadNextPage();
          }
          return;
        }
        loadNextPage();
      };
      const bottomScrollActions = { onArrive: handlePageChange };
      const innerRef = useRef<HTMLDivElement>(null);
      useImperativeHandle(ref, () => innerRef.current!, []);
      useScrollManager<HTMLDivElement>(innerRef, bottomScrollActions);
      return (
        <div className="select__options__wrapper" ref={innerRef}>
          <ul className="select__options__list">
            {map(displayedOptions, (value, key) => {
              const option = value as SelectOptionT;
              return renderOption(option);
            })}
          </ul>
        </div>
      );
    }
  )
);

export default OptionList;
