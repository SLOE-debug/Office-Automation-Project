import { Vue } from "vue-class-component";
import "@/assets/css/DesignerBasicsProvider/DragHelper.less";
import { Prop } from "vue-property-decorator";
import { DragHelperMoveType, PropItemType } from "@/Util/ControlCommonType";

export default class DragHelper extends Vue {
  @Prop({ default: true }) tl!: boolean;
  @Prop({ default: true }) tr!: boolean;
  @Prop({ default: true }) bl!: boolean;
  @Prop({ default: true }) br!: boolean;
  @Prop() props!: { [x: string]: PropItemType };

  adjustBasis: {
    [x: string]: boolean;
  } = {};

  DetectionCursor(e: MouseEvent) {
    let target = e.target as HTMLElement;
    if (target.classList[0] == "dot") {
      if (
        !this.adjustBasis[target.classList[1]] ||
        !this.adjustBasis[target.classList[2]]
      )
        this.CancelResize();
      this.adjustBasis = {
        top: false,
        bottom: false,
        left: false,
        right: false,
      };
      this.adjustBasis[target.classList[1]] = true;
      this.adjustBasis[target.classList[2]] = true;
    }
  }

  Resize(e: MouseEvent) {
    let { minWidth, minHeight } = this.props;
    let x = e.movementX;
    let y = e.movementY;
    if (this.adjustBasis.top) {
      y = -y;
      if ((this.props.height.v as number) + y > minHeight.v)
        this.props.top.v = parseFloat(
          ((this.props.top.v as number) + -y).toFixed(2)
        );
    }
    if (this.adjustBasis.left) {
      x = -x;
      if ((this.props.width.v as number) + x > minWidth.v)
        this.props.left.v = parseFloat(
          ((this.props.left.v as number) + -x).toFixed(2)
        );
    }
    let w = (this.props.width.v as number) + x;
    let h = (this.props.height.v as number) + y;
    if (w >= minWidth.v) this.props.width.v = w;
    if (h >= minHeight.v) this.props.height.v = h;
  }

  Slide(e: MouseEvent) {
    if (this.moveType) (this as any)[this.moveType](e);
  }

  Move(e: MouseEvent) {
    // let target = this.$el as HTMLElement;
    // let targetParentRect = target.parentElement!.parentElement!.getBoundingClientRect();
    // let targetRect = target.parentElement!.getBoundingClientRect();
    this.props.top.v = parseFloat(
      ((this.props.top.v as number) + e.movementY).toFixed(2)
    );
    this.props.left.v = parseFloat(
      ((this.props.left.v as number) + e.movementX).toFixed(2)
    );
    // let leftNum = Math.abs(
    //   Math.ceil(this.props.left.v + targetRect.width) - targetParentRect.width
    // );
    // if (leftNum < 5) {
    //   this.props.left.v = targetParentRect.width - targetRect.width;
    // }
    // let topNum = Math.abs(
    //   Math.ceil(this.props.top.v + targetRect.height) - targetParentRect.height
    // );
    // if (topNum < 5) {
    //   this.props.top.v = targetParentRect.height - targetRect.height;
    // }
  }

  moveType: DragHelperMoveType = DragHelperMoveType.None;
  BeginAdjust(e: MouseEvent) {
    let target = e.target as HTMLElement;
    if (target.classList[0] == "dot") this.moveType = DragHelperMoveType.Resize;
    else this.moveType = DragHelperMoveType.Move;
  }

  CancelResize() {
    this.moveType = DragHelperMoveType.None;
  }

  created() {
    document.addEventListener("mousemove", this.Slide);
    document.addEventListener("mouseup", this.CancelResize);
  }
  unmounted() {
    document.removeEventListener("mousemove", this.Slide);
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
