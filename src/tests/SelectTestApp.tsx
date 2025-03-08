import { useState } from "react";
import { DefaultSelectProps } from "src/Select/tests/utils/testingUtils";
import { SelectOptionList } from "src/Select/types/selectGeneralTypes";

import { Select } from "src/Select/components";

let categoryCount = 1;
const items = Array.from({ length: 1000 }, (_, i) => {
  let category = `Category-${categoryCount}`;
  if (i % 5 === 0) {
    categoryCount++;
  }
  return {
    id: i,
    name: `Option-${i}`,
    details: `The option-${i}`,
    category,
  };
});

const SelectTestApp = (props: DefaultSelectProps) => {
  const [value, setValue] = useState<SelectOptionList>([]);

  return (
    <Select
      {...props}
      value={value}
      removeSelectedOptionsFromList={false}
      defaultSelectOptions={items}
      onChange={setValue}
    />
  );
};

export default SelectTestApp;
