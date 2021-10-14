import axios, { AxiosRequestConfig, ResponseType, Method } from "axios";

/**
 * Api项的配置
 */
export type ApiConfigItem = {
  name: string;
  url: string;
  methodtype: Method;
  baseURL?: string;
  responseType?: ResponseType;
  headers?: any;
};

/**
 * 定义Api请求中心接口，描述该类型接口中必有得属性
 */
export interface Api {
  [index: string]: (data?: any) => Promise<any>;
}

/**
 * 通过Api配置项数组定义Api请求中心
 * @param apiConfig Api配置项数组
 * @param AxiosConfig 全局的Axios配置
 * @returns 返回一个Api请求中心
 */
export default function GlobalAxiosConfig(
  apiConfig: Array<ApiConfigItem>,
  AxiosConfig: AxiosRequestConfig
): Api {
  const api: Api = {};
  apiConfig.forEach(
    ({ name, url, methodtype, baseURL, responseType, headers }) => {
      api[name] = function(resolve?: any): Promise<any> {
        const newConfig = {
          ...AxiosConfig,
          url,
          method: methodtype,
          headers: {
            "Content-Type": "application/json;charset=utf-8",
            ...headers,
          },
        };
        if (baseURL) newConfig.baseURL = baseURL;
        if (responseType) newConfig.responseType = responseType;
        if (
          methodtype.toLowerCase() === "post" ||
          methodtype.toLowerCase() === "put"
        ) {
          newConfig.data = resolve;
        } else {
          newConfig.params = resolve;
        }

        return new Promise((res, rej) => {
          axios(newConfig)
            .then((res: any) => {
              res(res.data);
            })
            .catch((err: any) => {
              rej(err);
            });
        });
      };
    }
  );
  return api;
}
