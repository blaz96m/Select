import React, { useState, useRef, useCallback } from "react";
import { Select } from "./Select/main";
import {
  SelectOptionList,
  SelectOptionT,
} from "./Select/types/selectGeneralTypes";
import "./style.css";
import { sortBy } from "lodash";

const options = [
  { id: 1, name: "Orange", type: "fruit" },
  { id: 2, name: "Lemon", type: "fruit" },
  { id: 3, name: "Banana", type: "fruit" },
  { id: 4, name: "Cherry", type: "fruit" },
  { id: 5, name: "Peach", type: "fruit" },
  { id: 6, name: "Onion", type: "vegetable" },
  { id: 7, name: "Potato", type: "vegetable" },
  { id: 8, name: "Broccoli", type: "vegetable" },
  { id: 9, name: "Carrot", type: "vegetable" },
  { id: 10, name: "Spinach", type: "vegetable" },
  { id: 11, name: "Pineapple", type: "fruit" },
  { id: 12, name: "Blueberry", type: "fruit" },
  { id: 13, name: "Cranberry", type: "fruit" },
  { id: 14, name: "Lettuce", type: "vegetable" },
  { id: 15, name: "Cauliflower", type: "vegetable" },
];

const App = () => {
  const [value, setValue] = useState<SelectOptionList>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectOptions, setSelectOptions] = useState<SelectOptionList>(options);

  const customLoader = () => {
    return <div>Loading</div>;
  };

  const customOptionClassName = "haha";

  const isOptionDisabled = useCallback((option: SelectOptionT) => {
    return option.name === "Lemon";
  }, []);

  const customInputRef = useRef(null);

  const sorter = useCallback(
    (options: SelectOptionList) => sortBy(options, "name"),
    []
  );

  return (
    <React.Fragment>
      <div>
        <Select
          labelKey="name"
          isMultiValue={true}
          //isMultiValue={true}
          //isOptionDisabled={isOptionDisabled}
          sortFunction={sorter}
          recordsPerPage={10}
          //removeSelectedOptionsFromList={false}
          debounceInputUpdate={true}
          value={value}
          hasInput={true}
          customComponents={{ SelectLoaderElement: customLoader }}
          classNames={{ selectOption: { className: "haha" } }}
          refs={{ inputRef: customInputRef }}
          onChange={setValue}
          defaultSelectOptions={options}
        />
      </div>
    </React.Fragment>
  );
};

export default App;
