import React, { memo } from "react";
import { isFunction, map } from "lodash";
import {
  CustomSelectCategoryRenderer,
  SelectOptionList,
  SelectOptionT,
} from "./Select/types";

export type SelectCategoryProps = {
  categoryOptions: SelectOptionList;
  categoryName: keyof SelectOptionT;
  renderOption: (option: SelectOptionT) => React.JSX.Element;
};

const SelectCategory = memo(
  ({
    categoryOptions,
    categoryName,
    renderOption,
    customComponent,
  }: SelectCategoryProps & {
    customComponent?: CustomSelectCategoryRenderer;
  }) => {
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
