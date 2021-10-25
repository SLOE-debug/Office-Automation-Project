import { Options, Vue } from "vue-class-component";
import DragHelper from "./DragHelper";
import "@/assets/css/DesignerBasicsProvider/FormContainer.less";
import { Prop } from "vue-property-decorator";
import {
  CloneInstance,
  DocumentEventCenter,
  GetSuffix,
  Guid,
} from "@/Util/ControlCommonLib";
import { ControlItemType, PropItemType } from "@/Util/ControlCommonType";
import ContextMenu from "./ContextMenu";
import Control from "./Control";

@Options({
  emits: ["SelectControl"],
})
export default class FormContainer extends Vue {
  @Prop() Controls!: Array<ControlItemType>;
  props: { [x: string]: PropItemType } = {
    width: {
      lable: "宽度",
      v: 800,
      des: "控件的宽度",
      isStyle: true,
    },
    height: {
      lable: "高度",
      v: 500,
      des: "控件的高度",
      isStyle: true,
    },
    minWidth: {
      lable: "最小宽度",
      v: 50,
      des: "控件的最小宽度",
    },
    minHeight: {
      lable: "最小高度",
      v: 50,
      des: "控件的最小高度",
    },
    backgroundColor: {
      lable: "背景颜色",
      v: "#e3e3e3",
      des: "窗体的背景颜色",
      isStyle: true,
      isColor: true,
    },
  };
  get Style() {
    let styleObj = {} as any;
    for (const k in this.props) {
      if (this.props[k].isStyle) styleObj[k] = this.props[k].v + GetSuffix(k);
    }
    return styleObj;
  }

  GetCurrentControlIndex(cName: string) {
    return this.Controls.findIndex((c) => c.attr.name.v == cName);
  }

  selected = false;
  DeleteControl() {
    let RemoveControls: ControlItemType[] = [];
    this.$parent.selectedControls.forEach((c: Control) => {
      let ControlIndex = this.GetCurrentControlIndex(c.props.name.v.toString());
      RemoveControls.push(...this.Controls.splice(ControlIndex, 1));
    });
    this.$parent.selectedControls = [];
    return RemoveControls;
  }
  ArrowLeftControl() {
    this.$parent.selectedControls.forEach((c: Control) => {
      (c.props.left.v as number)--;
    });
  }
  ArrowRightControl() {
    this.$parent.selectedControls.forEach((c: Control) => {
      (c.props.left.v as number)++;
    });
  }
  ArrowUpControl() {
    this.$parent.selectedControls.forEach((c: Control) => {
      (c.props.top.v as number)--;
    });
  }
  ArrowDownControl() {
    this.$parent.selectedControls.forEach((c: Control) => {
      (c.props.top.v as number)++;
    });
  }
  copyControlType: {
    Type: string;
    attr: { [x: string]: PropItemType };
    props: { [x: string]: PropItemType };
  } | null = null;
  cControl(compulsive: boolean = false) {
    if (
      (this.controlKeyActivate && this.$parent.selectedControl) ||
      compulsive
    ) {
      this.copyControlType = {
        Type: this.$parent.selectedControl.Type,
        attr: this.$parent.selectedControl.attr,
        props: this.$parent.selectedControl.props,
      };
    } else {
      this.copyControlType = null;
    }
  }
  vControl() {
    if (this.copyControlType) {
      let attr = CloneInstance(this.copyControlType.attr);
      let props = CloneInstance(this.copyControlType.props);
      delete props["name"];
      delete props["top"];
      delete props["left"];
      attr.name.v = this.copyControlType.Type + this.Controls.length;
      (attr.top.v as number) += 20;
      (attr.left.v as number) += 20;
      this.Controls.push({
        Id: Guid().replace("-", ""),
        attr,
        props,
        controlType: this.copyControlType.Type,
      });
    }
  }

  controlKeyActivate = false;
  MonitorKey(e: KeyboardEvent) {
    let keyDown = e.type == "keydown";
    if (e.key == "Control")
      if (!this.controlKeyActivate)
        this.controlKeyActivate = keyDown ? true : false;
    if (keyDown) {
      let eventName = e.key + "Control";
      if (
        (e.target as HTMLElement).tagName != "INPUT" &&
        (this as any)[eventName] &&
        !this.selected
      )
        (this as any)[eventName]();
    }
  }

  BringToFront() {
    let RemoveControl = this.DeleteControl();
    this.Controls.push(...RemoveControl);
  }
  AtTheBottom() {
    let RemoveControl = this.DeleteControl();
    this.Controls.unshift(...RemoveControl);
  }
  MoveUpALayerOf(reversed: boolean = false) {
    let ControlIndex = this.GetCurrentControlIndex(
      this.$parent.selectedControls[0].props.name.v.toString()
    );
    if (ControlIndex == 0 && !reversed) return;
    if (ControlIndex == this.Controls.length - 1 && reversed) return;
    let start = ControlIndex - 1;
    let end = ControlIndex + 1;
    if (reversed) {
      start += 1;
      end += 1;
      ControlIndex++;
    }
    let beforeArr = this.Controls.slice(0, ControlIndex - 1);
    let exchangeArr = this.Controls.slice(start, end);
    let afterArr = this.Controls.slice(ControlIndex + 1);
    let len = this.Controls.length;
    for (let i = 0; i < len; i++) {
      this.Controls.pop();
    }
    [...beforeArr, ...exchangeArr.reverse(), ...afterArr].forEach((m) =>
      this.Controls.push(m)
    );
  }

  ContainerRect = new DOMRect();
  GlobalMenuControl(e: MouseEvent) {
    this.$store.commit("SetContextMenuPos", {
      top: e.y - this.ContainerRect.y,
      left: e.x - this.ContainerRect.x,
    });
    if (!(e as any).path.find((d: HTMLElement) => d.id == "Control")) {
      this.$parent.HiddenMenu();
    }
    e.preventDefault();
  }

  documentEvents = {
    keydown: this.MonitorKey,
    keyup: this.MonitorKey,
    contextmenu: this.GlobalMenuControl,
    mousemove: this.ResizeSelectFloatLayer,
    mouseup: this.ClearSelectFloatLayer,
  };
  created() {
    DocumentEventCenter.call(this, this.documentEvents);
    this.$nextTick(() => {
      this.ContainerRect = this.$refs.FormContainerDom.getBoundingClientRect();
    });
  }

  unmounted() {
    DocumentEventCenter.call(this, this.documentEvents, true);
  }

  ControlContextmenu(e: MouseEvent) {
    if (!this.$parent.selectedControls.length) return;
    this.$store.commit("SetContextMenus", [
      {
        title: "置于顶层",
        onCilck: this.BringToFront,
      },
      {
        title: "置于底层",
        onCilck: this.AtTheBottom,
      },
      {
        title: "复制",
        onCilck: () => this.cControl(true),
      },
      {
        title: "粘贴",
        show: !!this.copyControlType,
        onCilck: this.vControl,
      },
      {
        title: "上移一层",
        show: this.$parent.selectedControls.length == 1,
        onCilck: () => this.MoveUpALayerOf(true),
      },
      {
        title: "下移一层",
        show: this.$parent.selectedControls.length == 1,
        onCilck: () => this.MoveUpALayerOf(),
      },
    ]);
  }

  SelectControls(cName: Array<string> | null, e: MouseEvent) {
    let Controls = [this];
    if (cName) Controls = cName.map((c) => this.$refs[c]);
    this.$emit("SelectControl", Controls);
    this.$parent.HiddenMenu();
    e.stopPropagation();
  }

  get SelectFloatLayerStyle() {
    return {
      width: this.selectFloatLayerAttr.width + "px",
      height: this.selectFloatLayerAttr.height + "px",
      top: this.selectFloatLayerAttr.top + "px",
      left: this.selectFloatLayerAttr.left + "px",
    };
  }
  selectFloatLayerAttr = {
    width: 0,
    height: 0,
    top: 0,
    left: 0,
  };
  selectFloatLayerEnable = false;
  originalCoordinates = {
    x: 0,
    y: 0,
  };

  PlaceSelectFloatLayerTime = 0;
  PlaceSelectFloatLayer(e: MouseEvent) {
    this.PlaceSelectFloatLayerTime = e.timeStamp;
    this.selectFloatLayerEnable = true;
    let x = Math.round(e.x - this.ContainerRect.x);
    let y = Math.round(e.y - this.ContainerRect.y);
    this.originalCoordinates = {
      x,
      y,
    };
    this.selectFloatLayerAttr.top = y;
    this.selectFloatLayerAttr.left = x;
    this.selectFloatLayerAttr.width = 0;
    this.selectFloatLayerAttr.height = 0;
  }
  ClearSelectFloatLayer(e: MouseEvent) {
    let SelectControls = this.Controls.filter((c) => {
      let cInstance = this.$refs[c.attr.name.v.toString()];
      if (
        c.attr.top.v > this.selectFloatLayerAttr.top &&
        c.attr.left.v > this.selectFloatLayerAttr.left &&
        c.attr.top.v + cInstance.props.height.v <
          this.selectFloatLayerAttr.top + this.selectFloatLayerAttr.height &&
        c.attr.left.v + cInstance.props.width.v <
          this.selectFloatLayerAttr.left + this.selectFloatLayerAttr.width
      ) {
        return true;
      }
    }).map((c) => c.attr.name.v.toString());
    if (SelectControls.length) this.SelectControls(SelectControls, e);
    this.selectFloatLayerEnable = false;
    this.selectFloatLayerAttr.width = 0;
    this.selectFloatLayerAttr.height = 0;
  }
  ResizeSelectFloatLayer(e: MouseEvent) {
    if (this.selectFloatLayerEnable) {
      let currentX = Math.round(e.x - this.ContainerRect.x);
      let currentY = Math.round(e.y - this.ContainerRect.y);
      let w = Math.abs(currentX - this.originalCoordinates.x);
      let h = Math.abs(currentY - this.originalCoordinates.y);
      if (currentY < this.originalCoordinates.y)
        this.selectFloatLayerAttr.top = currentY;
      else this.selectFloatLayerAttr.top = this.originalCoordinates.y;
      if (currentX < this.originalCoordinates.x)
        this.selectFloatLayerAttr.left = currentX;
      else this.selectFloatLayerAttr.left = this.originalCoordinates.x;
      this.selectFloatLayerAttr.width = w;
      this.selectFloatLayerAttr.height = h;
    }
  }

  render() {
    return (
      <DragHelper
        {...{
          style: this.Style,
          tl: false,
          tr: false,
          bl: false,
          t: false,
          l: false,
          b: this.selected,
          r: this.selected,
          br: this.selected,
          props: this.props,
          CanMove: false,
        }}
      >
        {{
          default: () => (
            <>
              <ContextMenu />
              <div
                style={this.Style}
                id="FormContainer"
                ref="FormContainerDom"
                onClick={(e: MouseEvent) => {
                  if (e.timeStamp - this.PlaceSelectFloatLayerTime < 150)
                    this.SelectControls(null, e);
                }}
                onMousedown={this.PlaceSelectFloatLayer}
              >
                <div
                  class="SelectFloatLayer"
                  style={this.SelectFloatLayerStyle}
                  v-show={this.selectFloatLayerAttr.width != 0}
                ></div>
                {this.Controls.map((c, i) => {
                  let control = this.$.appContext.components[c.controlType];
                  return (
                    <control
                      key={c.Id}
                      Id={c.Id}
                      onContextmenu={this.ControlContextmenu}
                      attr={c.attr}
                      transmitProps={c.props}
                      style={"z-index:" + (i + 1)}
                      ref={c.attr.name.v}
                      controlType={c.controlType}
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                      }}
                      onMousedown={(e: MouseEvent) => {
                        if (
                          e.button == 0 &&
                          this.$parent.selectedControls.length <= 1
                        ) {
                          this.SelectControls([c.attr.name.v.toString()], e);
                        } else {
                          e.stopPropagation();
                        }
                      }}
                    ></control>
                  );
                })}
              </div>
            </>
          ),
        }}
      </DragHelper>
    );
  }
}
