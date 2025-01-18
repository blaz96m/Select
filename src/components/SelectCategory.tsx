import React, { memo } from "react";
import { isFunction, map } from "lodash";
import {
  CustomSelectCategoryRenderer,
  SelectOptionList,
  SelectOptionT,
} from "./Select/types";
import { useSelectContext } from "src/stores/providers/SelectProvider";

export type SelectCategoryProps = {
  categoryOptions: SelectOptionList;
  categoryName: keyof SelectOptionT;
  renderOption: (option: SelectOptionT) => React.JSX.Element;
};

const SelectCategory = memo(
  ({ categoryOptions, categoryName, renderOption }: SelectCategoryProps) => {
    const context = useSelectContext();
    const customComponent = context.components.SelectCategoryElement;
    return (
      <div>
        {isFunction(customComponent) ? (
          customComponent(
            { categoryName, categoryOptions },
            { className: "select__category__name" }
          )
        ) : (
          <p className="select__category__name">{categoryName}</p>
        )}
        <ul className="select__category__options-list">
          {map(categoryOptions, (option) => renderOption(option))}
        </ul>
      </div>
    );
  }
);

export default SelectCategory;
