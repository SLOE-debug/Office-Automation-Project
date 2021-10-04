import { Options, Vue } from "vue-class-component";
import "@/assets/css/plugins/Controls/DragHelper.less";

@Options({
  emits: ["resize"],
})
export default class Control extends Vue {
  InitResize(e: MouseEvent) {
    let target = e.target as HTMLElement;
    if (target.classList[0] == "dot") {
      this.$emit("resize", true);
    } else {
      this.$emit("resize", false);
    }
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
