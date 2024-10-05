import { ReactNode, memo } from "react";
import { map } from "lodash";
import {
  CategorizedSelectOptions,
  SelectOptionList,
  SelectOptionT,
} from "./types";

export type OptionListProps = {
  displayedOptions: SelectOptionList | CategorizedSelectOptions;
  renderOption: (option: SelectOptionT) => React.JSX.Element;
};

const OptionList = memo(
  ({ renderOption, displayedOptions }: OptionListProps) => {
    // scroll handler here
    return (
      <div
        className="select__options__wrapper"
        //ref={dropdownOptionsRef}
      >
        <ul className="select__options__list">
          {map(displayedOptions, (value, key) => {
            console.log("IN");
            const option = value as SelectOptionT;
            return renderOption(option);
          })}
        </ul>
      </div>
    );
  }
);

export default OptionList;
