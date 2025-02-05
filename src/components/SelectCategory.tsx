import React, { memo } from "react";
import { isElement, isEmpty, isFunction, isNumber, map, some } from "lodash";
import {
  CustomSelectCategoryRenderer,
  SelectOptionList,
  SelectOptionT,
} from "./Select/types";
import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectCategoryProps = {
  categoryOptions: SelectOptionList;
  categoryName: keyof SelectOptionT;
  selectedOptions: SelectOptionList | null;
  focusedOptionIdx: number | null;
  renderOption: (
    option: SelectOptionT,
    index: number,
    focusedOptionIdx: number | null,
    selectedOptions: SelectOptionList | null
  ) => JSX.Element;
};

const SelectCategory = memo(
  ({
    categoryOptions,
    categoryName,
    selectedOptions,
    renderOption,
    focusedOptionIdx,
  }: SelectCategoryProps) => {
    const context = useSelectContext();

    const {
      components: { SelectCategoryElement: customComponent },
      getSelectStateSetters,
    } = context;

    if (isEmpty(categoryOptions)) return;

    return (
      <div>
        {isFunction(customComponent) ? (
          customComponent(
            {
              categoryName,
              categoryOptions,
              selectedOptions,
              focusedOptionIdx,
              getSelectStateSetters,
            },
            { className: "select__category__name" }
          )
        ) : (
          <p className="select__category__name">{categoryName}</p>
        )}
        <ul className="select__category__options-list">
          {map(categoryOptions, (option, index) => {
            return renderOption(
              option,
              index,
              focusedOptionIdx,
              selectedOptions
            );
          })}
        </ul>
      </div>
    );
  }
);

export default SelectCategory;
