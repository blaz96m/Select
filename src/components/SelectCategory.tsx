import React, { memo } from "react";
import { map } from "lodash";
import { SelectOptionList, SelectOptionT } from "./Select/types";

type SelectCategoryProps = {
  categoryOptions: SelectOptionList;
  categoryName: keyof SelectOptionT;
  renderOption: (option: SelectOptionT) => React.JSX.Element;
};

const SelectCategory = memo(
  ({ categoryOptions, categoryName, renderOption }: SelectCategoryProps) => {
    return (
      <div className="select">
        <div className="select">
          <p className="select__category__name">{categoryName}</p>
        </div>
        <ul className="select__category__options-list">
          {map(categoryOptions, (option) => renderOption(option))}
        </ul>
      </div>
    );
  }
);

export default SelectCategory;
