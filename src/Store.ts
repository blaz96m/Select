import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { configureStore, createAction, createReducer } from "@reduxjs/toolkit";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { SelectOptionList } from "./Select/types/selectGeneralTypes";
import axiosClient from "./api/axios/axiosClient";
import { getMovieList } from "./App";
import { concat, debounce, filter, includes, isEmpty, toLower } from "lodash";

// Define the TS type for the counter slice's state
export interface DropdownState {
  isOpen: boolean;
  loading: boolean;
  selectOptions: SelectOptionList;
  secondSelectOptions: SelectOptionList;
  yearFilta: string;
  inputValue: string;
  page: number;
}

// Define the initial value for the slice state
const initialState: DropdownState = {
  isOpen: false,
  loading: false,
  selectOptions: [],
  secondSelectOptions: [],
  yearFilta: "",
  inputValue: "",
  page: 1,
};

export const getShit = createAsyncThunk(
  "dropdown/fetch",
  async (params, signal) => {
    return await getMovieList(params, signal); // Returns { data, totalRecords } directly
  }
);

export const getShieet = createAsyncThunk(
  "dropdown/fetchz",
  async (params, signal) => {
    return await getMovieList(params, signal); // Returns { data, totalRecords } directly
  }
);

export const onInputUpdate = createAsyncThunk(
  "dropdown/inp",
  async (inputVal: string, { getState }) => {
    const list = await getMovieList({ page: 1, searchQuery });
  }
);

export const getSecondShieeet = createAsyncThunk(
  "dropdown/anotherFetch",
  async (params, { getState }) => {
    const state = getState();
    const { page, year } = params;
    const finalYear = year || state.yearFilta;
    const url = finalYear
      ? `/search/movie?query=${"a"}&page=${page}&year=${finalYear}`
      : `/search/movie?query=${"a"}&page=${page}`;
    const reselt = await axiosClient.get(url);
    const data = reselt.data;
    const totalRecords = data["total_results"];
    return { data: data.results as SelectOptionList, totalRecords };
  }
);

const handler = async (inputValue: string, { getState, dispatch }) => {
  const state = getState();
  const dropdownOptions = state.dropdown.selectOptions;
  const filteredOptions = filter(dropdownOptions, (option) => {
    const opcija = toLower(option.title);
    const inputVel = toLower(inputValue);
    return opcija.includes(inputVel);
  });
  dispatch(setSelectOptions(filteredOptions));
};

const debouncedHandler = debounce(handler, 600);
export const filterOptions = createAsyncThunk(
  "dropdown/filterOptionsDebounce",
  (inputVal: string, args) => {
    return debouncedHandler(inputVal, args);
  }
);

// Slices contain Redux reducer logic for updating state, and
// generate actions that can be d to trigger those updates.
export const dropdownSlice = createSlice({
  name: "dropdown", // Fix typo here
  initialState,
  reducers: {
    setIsOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    setSelectOptions: (state, action) => {
      state.selectOptions = action.payload;
    },
    setSecondSelectOption: (state, action) => {
      state.secondSelectOptions = action.payload;
    },
    setYearFilta: (state, action) => {
      state.yearFilta = action.payload;
    },
    setInputValue: (state, action) => {
      state.inputValue = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getShit.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getShit.fulfilled, (state, action) => {
      state.loading = false;
    });

    builder.addCase(getShieet.fulfilled, (state, action) => {
      state.secondSelectOptions = action.payload?.data;
    });

    builder.addCase(getSecondShieeet.fulfilled, (state, action) => {
      state.secondSelectOptions = action.payload.data;
    });
    builder.addCase(onInputUpdate.fulfilled, (state, action) => {
      state.selectOptions = action.payload;
    });
  },
});

export const {
  setIsOpen,
  setSelectOptions,
  setSecondSelectOption,
  setYearFilta,
  setInputValue,
  setPage,
} = dropdownSlice.actions;

export const store = configureStore({
  reducer: {
    dropdown: dropdownSlice.reducer, // Fix typo here
  },
});

export const selectDropdownState = (state: RootState) => state.dropdown;

// Infer the type of `store`
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];
// Define a reusable type describing thunk functions
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
