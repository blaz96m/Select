import React, { memo } from "react";
import { isElement, isEmpty, isFunction, isNumber, map, some } from "lodash";

import { SelectCategoryProps } from "src/Select/types/selectComponentTypes";
import { useSelectContext } from "src/Select/components/SelectProvider";

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
