import { isFunction, merge } from "lodash";
import {
  RequestConfig,
  Response,
  RequestParams,
} from "src/general/hooks/useQueryManager";
import { REQUEST_CONFIG_DEFAULT_VALUES } from "src/general/utils/queryManager/constants";

type DefaultRequestParams = {
  sort: "sort";
  searchQuery: "searchQuery";
  page: "page";
};

export const setConfig = <T>(
  propValues?: Partial<RequestConfig>,
  fetchFunction?: (...args: any) => Promise<Response<T> | void>
) => {
  const config = REQUEST_CONFIG_DEFAULT_VALUES;
  if (!isFunction(fetchFunction) || !propValues) {
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
