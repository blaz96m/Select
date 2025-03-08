import { useCallback, useState } from "react";
import { DefaultSelectProps } from "src/Select/tests/utils/testingUtils";
import { SelectOptionList } from "src/Select/types/selectGeneralTypes";
import axiosClient from "src/api/axios/axiosClient";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getMovieList = useCallback(
    async ({ page = 1, searchQuery = "a" }, signal?: AbortSignal) => {
      try {
        setIsLoading(true);
        const reselt = await axiosClient.get(
          `/search/movie?query=${searchQuery || "a"}&page=${page}`
        );
        setIsLoading(false);
        const data = reselt.data;
        const totalRecords = data["total_results"];
        return { data: data.results as SelectOptionList, totalRecords };
      } catch (err) {
        err;
      }
    },
    []
  );

  return (
    <Select
      {...props}
      //fetchFunction={getMovieList}
      value={value}
      defaultSelectOptions={items}
      onChange={setValue}
      isLoading={isLoading}
    />
  );
};

export default SelectTestApp;
