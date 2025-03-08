import {
  useState,
  memo,
  useCallback,
  useRef,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import {
  SelectOptionInnerProps,
  SelectMultiValueInnerProps,
  SelectSingleValueProps,
  SelectDropdownIndicatorInnerProps,
  SelectInputInnerProps,
  SelectClearIndicatorInnerProps,
} from "src/Select/types/selectComponentTypes";
import { SelectOptionProps } from "./components/Select/SelectOption";
import {
  debounce,
  filter,
  includes,
  isEmpty,
  reduce,
  some,
  split,
  toLower,
  trim,
} from "lodash";
import { SelectMultiValueProps } from "./components/Select/SelectMultiValueElement";
import { SelectValueProps } from "./components/Select/SelectValue";
import { SelectDropdownIndicatorProps } from "./components/Select/SelectDropdownIndicator";
import {
  faEarthAfrica,
  faEarthAmerica,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SelectInputProps } from "./components/Select/SelectInput";
import { SelectClearIndicatorProps } from "./components/Select/SelectClearIndicator";
import { SelectCategoryProps } from "./Select/components/SelectCategory";

import { Select } from "./Select/components";

import { useSelect } from "./Select/hooks";
import { Provider, useDispatch, useSelector } from "react-redux";
import { RootState } from "@reduxjs/toolkit/query";
import { CategorizedSelectOptions } from "./Select/types/selectGeneralTypes";
import {
  CustomSelectInputComponentProps,
  CustomSelectOptionComponentProps,
} from "./Select/types/selectComponentTypes";
import { M } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
import { C } from "vitest/dist/chunks/reporters.QZ837uWx.js";

let categoryCount = 1;
const items = Array.from({ length: 1000 }, (_, i) => {
  let category = `Category-${categoryCount}`;
  if (i % 5 === 0) {
    categoryCount++;
  }
  return {
    id: i,
    name: `Option-${i}`,
    details: `The option ${i}`,
    category,
  };
});

function App() {
  const [value, setValue] = useState<SelectOptionList>([]);

  return (
    <>
      <Select
        value={value}
        //defaultSelectOptions={items}
        onChange={setValue}
        useAsync={true}
        isMultiValue={true}
        hasInput={true}
        labelKey={"title"}
        categoryKey={"original_language"}
        isCategorized={true}
        recordsPerPage={20}
        fetchOnScroll={true}
        lazyInit={true}
      />
    </>
  );
}

export default App;
