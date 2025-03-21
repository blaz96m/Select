import { merge } from "lodash-es";
import {
  RequestConfig,
  RequestParams,
} from "src/general/hooks/useQueryManager";
import { REQUEST_CONFIG_DEFAULT_VALUES } from "src/general/utils/queryManager/constants";

type DefaultRequestParams = {
  sort: "sort";
  searchQuery: "searchQuery";
  page: "page";
};

export const setConfig = (propValues?: Partial<RequestConfig>) => {
  const config = REQUEST_CONFIG_DEFAULT_VALUES;
  if (propValues?.isDisabled) {
    config.isDisabled = true;
    return config;
  }
  return merge(config, propValues);
};

const resolveParam = (
  defaultParamVal: any,
  params: Partial<RequestParams> | undefined,
  paramProperty: keyof DefaultRequestParams
) =>
  params && params[paramProperty] ? params[paramProperty] : defaultParamVal;

export const resolveAndGetRequestParams = (
  params: Partial<RequestParams> | undefined,
  defaultParamValues: { searchQuery: string; page: number; sort: string },
  requestConfig: RequestConfig
) => {
  const { searchQuery, page, sort } = defaultParamValues;
  return {
    searchQuery: resolveParam(searchQuery, params, "searchQuery"),
    sort: resolveParam(sort, params, "sort"),
    page: resolveParam(page, params, "page"),
    recordsPerPage: requestConfig.recordsPerPage,
    ...params,
  };
};
