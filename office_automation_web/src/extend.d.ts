import { Api } from "./plugins/GlobalAxiosConfig";
import {
  ContextMenuItemType,
  ContextMenuPosType,
} from "./Util/ControlCommonType";

declare module "@vue/runtime-core" {
  export interface ComponentCustomProperties {
    $Api: Api;
    $ControlList: Array<string>;
    $refs: any;
    $parent: any;
    $store: any;
  }
}
