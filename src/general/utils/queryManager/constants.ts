import { RequestConfig } from "src/general/hooks/useQueryManager";

export const REQUEST_CONFIG_DEFAULT_VALUES: RequestConfig = {
  isDisabled: false,
  fetchOnInit: true,
  defaultSort: "",
  recordsPerPage: 15,
  inputFetchDeboubceDuration: 700,
  fetchOnInputChange: true,
};

export const INITIAL_STATE = {
  page: 1,
  sort: "",
  searchQuery: "",
};
