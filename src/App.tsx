import { useState } from "react";
import Select from "./components/Select/Select";
import { SelectOptionT } from "./components/Select/types/selectTypes";
import "src/style.scss";

function App() {
  let currCategoryCount = 1;
  const options = Array.from({ length: 100 }, (val, index) => {
    if ((index + 1) % 5 === 0) {
      currCategoryCount += 1;
    }
    return {
      id: `${index}`,
      name: `Select Value - ${index + 1}`,
      category: `Category-${currCategoryCount}`,
    };
  });
  const [value, setValue] = useState<SelectOptionT[]>([]);

  return (
    <>
      <Select
        isMultiValue={false}
        value={value}
        labelKey="name"
        selectOptions={options}
        categoryKey="category"
        isCategorized={true}
        onChange={setValue}
        fetchOnInputChange={false}
        closeDropdownOnOptionSelect={false}
        removeSelectedOptionsFromList={false}
      />
    </>
  );
}

export default App;
