import { useState } from "react";
import Select from "./components/Select/Select";
import { SelectOptionT } from "./components/Select/types/selectTypes";
import "src/style.scss";

function App() {
  const options = Array.from({ length: 50 }, (val, index) => ({
    id: `${index}`,
    name: `Select Value - ${index}`,
  }));
  const [value, setValue] = useState<SelectOptionT[]>([]);

  return (
    <>
      <Select
        isMultiValue={false}
        value={value}
        valueKey="name"
        selectOptions={options}
        onChange={setValue}
      />
    </>
  );
}

export default App;
