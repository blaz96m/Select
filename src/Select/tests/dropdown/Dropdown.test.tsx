import {
  fireEvent,
  getAllByTestId,
  queryByAttribute,
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
import {} from "vitest/dist/chunks/suite.qtkXWc6R.js";
import React from "react";

const DEFAULT_RECORDS_PER_PAGE = 20;

describe("Select Dropdown", () => {
  it("Select Dropdown is closed by default", () => {
    const { container } = render(
      <SelectTestApp
        {...defaultSelectProps}
        recordsPerPage={DEFAULT_RECORDS_PER_PAGE}
      />
    );
    const selectOptionListElement = queryByAttribute(
      "data-testid",
      container,
      SELECT_OPTION_TESTID
    );
    expect(selectOptionListElement).toBeNull();
  });
  it("Select Dropdown is opened by clicking on the top portion of the select element and the selectOptions are shown", async () => {
    const { getByTestId, container } = render(
      <SelectTestApp {...defaultSelectProps} />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElements = await waitFor(() =>
      getAllByTestId(container, SELECT_OPTION_TESTID)
    );
    expect(selectOptionElements).toHaveLength(20);
    const firstElement = head(selectOptionElements);
    expect(firstElement).toBeVisible();
  });
  it("Input element is focused after openning the dropdown", async () => {
    const { getByTestId } = render(<SelectTestApp {...defaultSelectProps} />);
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    const selectInputElement = getByTestId("select-input");
    fireEvent.click(selectTopContainer);
    expect(selectInputElement).toHaveFocus();
  });
  it("First Option in the list is focused after openning the dropdown", async () => {
    const { container, getByTestId } = render(
      <SelectTestApp {...defaultSelectProps} />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptionElement = await waitFor(() =>
      getAllByTestId(container, SELECT_OPTION_TESTID)
    );
    const firstElement = head(selectOptionElement);
    expect(firstElement).toHaveAttribute("data-focused", "true");
  });
  it("Select Dropdown is closed on second click", () => {
    const { getByTestId, container } = render(
      <SelectTestApp {...defaultSelectProps} />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    fireEvent.click(selectTopContainer);
    const selectOptionListElement = queryByAttribute(
      "data-testid",
      container,
      SELECT_OPTION_TESTID
    );
    expect(selectOptionListElement).toBeNull();
  });
  it("Select Dropdown is closed on option select if the closeDropdownOnOptionSelect prop is true", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp
        {...defaultSelectProps}
        closeDropdownOnSelect={true}
        isMultiValue={true}
      />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptions = getAllByTestId(SELECT_OPTION_TESTID);
    const firstOption = head(selectOptions);
    fireEvent.click(selectTopContainer!);
    expect(firstOption).not.toBeVisible();
  });
  it("Select Dropdown is not closed on option select if the closeDropdownOnOptionSelect prop is false", async () => {
    const { getByTestId, getAllByTestId } = render(
      <SelectTestApp
        {...defaultSelectProps}
        closeDropdownOnSelect={false}
        removeSelectedOptionsFromList={false}
      />
    );
    const selectTopContainer = getByTestId(SELECT_TOP_TESTID);
    fireEvent.click(selectTopContainer);
    const selectOptions = getAllByTestId(SELECT_OPTION_TESTID);
    const firstOption = head(selectOptions);
    fireEvent.click(firstOption!);
    expect(firstOption).toBeVisible();
  });
});
