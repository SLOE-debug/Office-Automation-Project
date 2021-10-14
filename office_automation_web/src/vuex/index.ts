import {
  ContextMenuItemType,
  ContextMenuPosType,
} from "@/Util/ControlCommonType";
import { createStore } from "vuex";

let sotreModel = {
  ContextMenus: [] as Array<ContextMenuItemType>,
  ContextMenuPos: { top: 0, left: 0 } as ContextMenuPosType,
};

export default createStore({
  state() {
    return sotreModel;
  },
  getters: {
    ContextMenus(state: typeof sotreModel) {
      return state.ContextMenus;
    },
    ContextMenuPos(state: typeof sotreModel) {
      return state.ContextMenuPos;
    },
  },
  mutations: {
    SetContextMenus(
      state: typeof sotreModel,
      newContextMenus: Array<ContextMenuItemType>
    ) {
      state.ContextMenus = newContextMenus;
    },
    SetContextMenuPos(
      state: typeof sotreModel,
      newContextMenuPos: ContextMenuPosType
    ) {
      state.ContextMenuPos = newContextMenuPos;
    },
  },
});
