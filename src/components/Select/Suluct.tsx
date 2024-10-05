import { DEFAULT_SELECT_PLACEHOLDER } from "src/utils/select/constants";
import { SelectProps } from "./Select";

import {
  SelectContainer,
  SelectInput,
  SelectValue,
  TopContainer,
  ValueSection,
  IndicatorSection,
  DropdownIndicator,
  OptionList,
} from "src/components/Select";
import { Spinner } from "../Spinner";
import { SelectOptionT } from "./types/selectTypes";

type SuluctProps = {
  hasInput?: boolean;
  fetchOnScrool?: boolean;
  lazyInit?: boolean;
  isMultiValue?: boolean;
  placeHolder?: string;
  onInputChange?: (inputValue?: string) => {};
  valueKey: keyof SelectOptionT;
};

const Suluct = ({
  valueKey = "name",
  onInputChange,
  isMultiValue = false,
  hasInput = true,
  placeHolder = DEFAULT_SELECT_PLACEHOLDER,
}: SuluctProps) => {
  return (
    <Suluct.Container>
      <Suluct.Top>
        <Suluct.ValueSection isMultiValue={isMultiValue}>
          <Suluct.Value
            valueKey={valueKey}
            isMultiValue={isMultiValue}
            placeHolder={placeHolder}
          />
          {hasInput && (
            <Suluct.Input
              isMultiValue={isMultiValue}
              customOnChange={onInputChange}
            />
          )}
        </Suluct.ValueSection>
        <Suluct.IndicatorSection isLoading={false} spinner={<Suluct.Spinner />}>
          <Suluct.DropdownIndicator />
        </Suluct.IndicatorSection>
      </Suluct.Top>
      <Suluct.OptionList
        valueKey={valueKey}
        isMultiValue={isMultiValue}
        isCategorized={false}
      />
    </Suluct.Container>
  );
};

export default Suluct;

Suluct.Container = SelectContainer;
Suluct.Top = TopContainer;
Suluct.ValueSection = ValueSection;
Suluct.IndicatorSection = IndicatorSection;
Suluct.Spinner = Spinner;
Suluct.Value = SelectValue;
Suluct.Input = SelectInput;
Suluct.DropdownIndicator = DropdownIndicator;
Suluct.OptionList = OptionList;
