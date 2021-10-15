import { ContextMenuItemType } from "@/Util/ControlCommonType";
import { Vue } from "vue-class-component";
import "@/assets/css/DesignerBasicsProvider/ContextMenu.less";

export default class ContextMenu extends Vue {
  render() {
    return (
      <div
        id="ControlContextMenu"
        style={{
          top: this.$store.getters.ContextMenuPos.top + "px",
          left: this.$store.getters.ContextMenuPos.left + "px",
        }}
      >
        {this.$store.getters.ContextMenus.map((m: ContextMenuItemType) => {
          if (m.show == false) return;
          return (
            <div class="ContextMenu" onClick={m.onCilck as any}>
              {m.title}
            </div>
          );
        })}
      </div>
    );
  }
}
