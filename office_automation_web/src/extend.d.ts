import { Api } from "./plugins/GlobalAxiosConfig";

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    $Api: Api;
    $ControlList: Array<string>;
    $refs: any;
    $parent: any;
  }
}
