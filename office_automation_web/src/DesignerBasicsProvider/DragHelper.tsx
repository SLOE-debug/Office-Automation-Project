import { Vue } from "vue-class-component";
import "@/assets/css/DesignerBasicsProvider/DragHelper.less";
import { Prop } from "vue-property-decorator";
import { DragHelperMoveType, PropItemType } from "@/Util/ControlCommonType";
import { CloneInstance, DocumentEventCenter } from "@/Util/ControlCommonLib";
import Control from "./Control";

export default class DragHelper extends Vue {
  @Prop({ default: true }) CanMove!: boolean;
  @Prop({ default: true }) tl!: boolean;
  @Prop({ default: true }) tr!: boolean;
  @Prop({ default: true }) bl!: boolean;
  @Prop({ default: true }) br!: boolean;
  @Prop({ default: true }) t!: boolean;
  @Prop({ default: true }) b!: boolean;
  @Prop({ default: true }) l!: boolean;
  @Prop({ default: true }) r!: boolean;
  @Prop() props!: { [x: string]: PropItemType };

  adjustBasis: {
    [x: string]: boolean;
  } = {};

  individualAdjustment = "";
  DetectionCursor(e: MouseEvent) {
    let target = e.target as HTMLElement;
    if (target.classList[0] == "dot") {
      this.adjustBasis = {
        top: false,
        bottom: false,
        left: false,
        right: false,
      };
      this.individualAdjustment = "";
      this.adjustBasis[target.classList[1]] = true;
      if (target.classList[2][1] != "R")
        this.adjustBasis[target.classList[2]] = true;
      else this.individualAdjustment = target.classList[1];
    }
  }

  Resize(e: MouseEvent) {
    let forbidWidth =
      this.individualAdjustment != "left" &&
      this.individualAdjustment != "right";
    let forbidHeight =
      this.individualAdjustment != "top" &&
      this.individualAdjustment != "bottom";
    let { minWidth, minHeight } = this.props;
    let x = e.movementX;
    let y = e.movementY;
    if (this.adjustBasis.top) {
      y = -y;
      if ((this.props.height.v as number) + y >= minHeight.v) {
        this.props.top.v = parseFloat(
          ((this.props.top.v as number) + -y).toFixed(2)
        );
      }
    }
    if (this.adjustBasis.left) {
      x = -x;
      if ((this.props.width.v as number) + x >= minWidth.v)
        this.props.left.v = parseFloat(
          ((this.props.left.v as number) + -x).toFixed(2)
        );
    }
    let w = (this.props.width.v as number) + x;
    let h = (this.props.height.v as number) + y;
    if (w >= minWidth.v && forbidHeight) this.props.width.v = w;
    if (h >= minHeight.v && forbidWidth) this.props.height.v = h;
  }

  Slide(e: MouseEvent) {
    if (this.moveType) (this as any)[this.moveType](e);
  }

  Move(e: MouseEvent) {
    if (!this.CanMove) return;
    this.props.top.v = parseFloat(
      ((this.props.top.v as number) + e.movementY).toFixed(2)
    );
    this.props.left.v = parseFloat(
      ((this.props.left.v as number) + e.movementX).toFixed(2)
    );
  }

  important = false;

  moveType: DragHelperMoveType = DragHelperMoveType.None;
  BeginAdjust(e: MouseEvent) {
    if (e.button != 0) return;
    let target = e.target as HTMLElement;
    if (target.classList[0] == "dot")
      this.moveType = DragHelperMoveType.Resize;
    else this.moveType = DragHelperMoveType.Move;
    if (this.CanMove) {
      let CurrentSelectedControls = this.$parent.$parent.$parent.$parent
        .selectedControls as Array<Control>;
      CurrentSelectedControls.forEach((c) => {
        if (c.Id && c.Id != this.$parent.Id) {
          c.$refs["DragHelper"].moveType = this.moveType;
          c.$refs["DragHelper"].individualAdjustment =
            this.individualAdjustment;
          c.$refs["DragHelper"].adjustBasis = CloneInstance(this.adjustBasis);
        }
      });
    }
  }

  CancelResize() {
    this.moveType = DragHelperMoveType.None;
  }

  documentEvents = {
    mousemove: this.Slide,
    mouseup: this.CancelResize,
  };

  created() {
    DocumentEventCenter.call(this, this.documentEvents);
  }
  unmounted() {
    DocumentEventCenter.call(this, this.documentEvents, false);
  }

  render() {
    let dots: Array<JSX.Element> = [];
    let className = "HelperBlock";

    if (this.moveType == DragHelperMoveType.None) {
      if (this.important) className += " important";
      dots = [
        <div class={`dot top left seResize`} v-show={this.tl}></div>,
        <div class={`dot top right neResize`} v-show={this.tr}></div>,
        <div class={`dot bottom left neResize`} v-show={this.bl}></div>,
        <div class={`dot bottom right seResize`} v-show={this.br}></div>,
        <div class={`dot top nResize`} v-show={this.t}></div>,
        <div class={`dot bottom nResize`} v-show={this.b}></div>,
        <div class={`dot left eResize`} v-show={this.l}></div>,
        <div class={`dot right eResize`} v-show={this.r}></div>,
      ];
    } else {
      if (this.CanMove) className += " HelperBlockMoving";
    }

    return (
      <div
        class={className}
        onMousemove={this.DetectionCursor}
        onMousedown={this.BeginAdjust}
      >
        {...dots}
        {this.$slots.default ? this.$slots.default() : ""}
      </div>
    );
  }
}
