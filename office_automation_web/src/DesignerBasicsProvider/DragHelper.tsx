import { Vue } from "vue-class-component";
import "@/assets/css/DesignerBasicsProvider/DragHelper.less";
import { Prop } from "vue-property-decorator";

export default class DragHelper extends Vue {
  @Prop({ default: true }) tl!: boolean;
  @Prop({ default: true }) tr!: boolean;
  @Prop({ default: true }) bl!: boolean;
  @Prop({ default: true }) br!: boolean;
  @Prop() props!: any;

  canResize = false;
  DetectionCursor(e: MouseEvent) {
    let target = e.target as HTMLElement;
    this.canResize = target.classList[0] == "dot";
  }

  Resize(e: MouseEvent) {
    if (this.resizing) {
      let { minWidth, minHeight } = this.props;
      let w = this.props.width.v + e.movementX;
      let h = this.props.height.v + e.movementY;
      if (w >= minWidth.v) this.props.width.v = w;
      if (h >= minHeight.v) this.props.height.v = h;
    }
  }

  resizing = false;
  BeginAdjust(e: MouseEvent) {
    let target = e.target as HTMLElement;
    if (target.classList[0] == "dot") {
      this.resizing = true;
    }
  }

  CancelResize() {
    this.resizing = false;
  }

  created() {
    document.addEventListener("mousemove", this.Resize);
    document.addEventListener("mouseup", this.CancelResize);
  }
  unmounted() {
    document.removeEventListener("mousemove", this.Resize);
    document.removeEventListener("mouseup", this.CancelResize);
  }

  render() {
    return (
      <div
        class="HelperBlock"
        onMousemove={this.DetectionCursor}
        onMousedown={this.BeginAdjust}
      >
        <div class="dot top left seResize" v-show={this.tl}></div>
        <div class="dot top right neResize" v-show={this.tr}></div>
        <div class="dot bottom left neResize" v-show={this.bl}></div>
        <div class="dot bottom right seResize" v-show={this.br}></div>
      </div>
    );
  }
}
