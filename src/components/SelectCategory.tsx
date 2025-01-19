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
  renderOption: (option: SelectOptionT, key: any) => React.JSX.Element;
};

const SelectCategory = memo(
  ({ categoryOptions, categoryName, renderOption }: SelectCategoryProps) => {
    const context = useSelectContext();

    const {
      components: { SelectCategoryElement: customComponent },
      getSelectAsyncStateSetters,
      getSelectStateSetters,
    } = context;
    return (
      <div>
        {isFunction(customComponent) ? (
          customComponent(
            {
              categoryName,
              categoryOptions,
              getSelectAsyncStateSetters,
              getSelectStateSetters,
            },
            { className: "select__category__name" }
          )
        ) : (
          <p className="select__category__name">{categoryName}</p>
        )}
        <ul className="select__category__options-list">
          {map(categoryOptions, (option, key) => renderOption(option, key))}
        </ul>
      </div>
    );
  }
);

export default SelectCategory;
