import { Vue } from "vue-class-component";
import "@/assets/css/plugins/Controls/DragHelper.less";

export default class Control extends Vue {
  InitResize(e: MouseEvent) {
    let target = e.target as HTMLElement;
    if (target.classList[0] == "dot") {
      console.log(
        "选择圆点：" + target.classList[1] + "," + target.classList[2]
      );
    }
  }
  render() {
    return (
      <div class="HelperBlock" onMouseover={this.InitResize}>
        <div class="dot top left seResize"></div>
        <div class="dot top right neResize"></div>
        <div class="dot bottom right seResize"></div>
        <div class="dot bottom left neResize"></div>
      </div>
    );
  }
}
