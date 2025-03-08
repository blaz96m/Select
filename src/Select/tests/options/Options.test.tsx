import {
  fireEvent,
  getAllByTestId,
  render,
  waitFor,
} from "@testing-library/react";
import SelectTestApp from "src/tests/SelectTestApp";
import { describe, expect, it } from "vitest";
import {
  SELECT_OPTION_TESTID,
  SELECT_TOP_TESTID,
  defaultSelectProps,
} from "../utils/testingUtils";
import { head } from "lodash";
import React from "react";

const DEFAULT_RECORDS_PER_PAGE = 10;

describe("Select Options", () => {
  it("The length of rendered options matches the records per page prop", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp
        {...defaultSelectProps}
        recordsPerPage={DEFAULT_RECORDS_PER_PAGE}
      />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(container, SELECT_OPTION_TESTID)
    );
    expect(selectOptionElements).toHaveLength(DEFAULT_RECORDS_PER_PAGE);
  });
  it("The option categories get rendered when the isCategorizedProp is provided", async () => {
    const { getAllByTestId, getByTestId } = render(
      <SelectTestApp {...defaultSelectProps} isCategorized={true} />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectCategoryList = await waitFor(() =>
      getAllByTestId("select-category-list")
    );
    const firstCategoryList = head(selectCategoryList);
    expect(firstCategoryList).toBeVisible();
  });
  it("The length of rendered options matches the records per page prop when the isCategorized prop is provided", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp
        {...defaultSelectProps}
        recordsPerPage={DEFAULT_RECORDS_PER_PAGE}
        isCategorized={true}
      />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(container, SELECT_OPTION_TESTID)
    );
    expect(selectOptionElements).toHaveLength(DEFAULT_RECORDS_PER_PAGE);
  });
  it("Removes the option from the list on select if the removeSelectedOptionsFromList prop is provided", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp
        {...defaultSelectProps}
        recordsPerPage={DEFAULT_RECORDS_PER_PAGE}
        removeSelectedOptionsFromList={true}
      />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(container, SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    fireEvent.click(firstOption!);
    expect(firstOption).not.toBeVisible();
  });
  it("Keeps the option in the list on select if the removeSelectedOptionsFromList prop is false, and the selected attribute is aplied to the option", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp
        {...defaultSelectProps}
        recordsPerPage={DEFAULT_RECORDS_PER_PAGE}
        removeSelectedOptionsFromList={false}
        closeDropdownOnSelect={false}
      />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(container, SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    fireEvent.click(firstOption!);
    expect(firstOption).toBeVisible();
    expect(firstOption).toHaveAttribute("data-selected", "true");
  });
  it("Options have the data category attribute if the isCategorized prop is provided", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp
        {...defaultSelectProps}
        recordsPerPage={DEFAULT_RECORDS_PER_PAGE}
        isCategorized={true}
      />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(container, SELECT_OPTION_TESTID)
    );
    const firstOption = head(selectOptionElements);
    expect(firstOption).toHaveAttribute("data-category", "Category-1");
  });
});
