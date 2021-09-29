import GlobalAxiosConfig, { ApiConfigItem } from "./GlobalAxiosConfig";

const api: Array<ApiConfigItem> = [
  // 示例：登录接口
  {
    name: "login", // 调用的名字
    url: "/login", // 接口地址
    methodtype: "POST", // 请求方法
  },
];

/**
 * 安装Api请求中心
 * @returns 返回Api请求中心实例
 */
export default function InstallAxios() {
  return GlobalAxiosConfig(api, {});
}
