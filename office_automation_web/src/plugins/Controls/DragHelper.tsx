import { Vue } from "vue-class-component";
import "@/assets/css/plugins/Controls/DragHelper.less";

export default class Control extends Vue {
  InitResize(e: MouseEvent) {
    let target = e.target as HTMLElement;
    let resize = target.classList[0] == "dot";
    (this.$parent as any).CanDrag = !resize;
  }
  render() {
    return (
      <div class="HelperBlock" onMousemove={this.InitResize}>
        <div class="dot top left seResize"></div>
        <div class="dot top right neResize"></div>
        <div class="dot bottom right seResize"></div>
        <div class="dot bottom left neResize"></div>
      </div>
    );
  }
}
