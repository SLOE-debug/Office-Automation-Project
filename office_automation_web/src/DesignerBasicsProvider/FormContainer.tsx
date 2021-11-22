import { Options, Vue } from "vue-class-component";
import DragHelper from "./DragHelper";
import "@/assets/css/DesignerBasicsProvider/FormContainer.less";
import { Prop, Watch } from "vue-property-decorator";
import {
  CloneInstance,
  DocumentEventCenter,
  GetPathByDom,
  GetSuffix,
  Guid,
} from "@/Util/ControlCommonLib";
import {
  ControlItemType,
  DragHelperMoveType,
  EqualType,
  EventItemType,
  JustifyingType,
  PropItemType,
} from "@/Util/ControlCommonType";
import ContextMenu from "./ContextMenu";
import Control from "./Control";
import { CodeEditor } from "./CodeEditor";

@Options({
  emits: ["SelectControl"],
})
export default class FormContainer extends Vue {
  @Prop() Controls!: Array<ControlItemType>;
  props: { [x: string]: PropItemType } = {
    name: {
      lable: "pageForm",
      v: "pageForm",
      des: "pageForm",
      isHidden: true,
    },
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
  events: { [x: string]: EventItemType } = {
    onLoad: {
      lable: "完成事件",
      des: "当窗体加载完成事件",
      v: undefined,
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
  copyControlTypes: Array<{
    Type: string;
    attr: { [x: string]: PropItemType };
    props: { [x: string]: PropItemType };
  }> | null = null;
  pasteN = 1;
  cControl(compulsive: boolean = false) {
    if (
      (this.controlKeyActivate && this.$parent.selectedControls.length) ||
      compulsive
    ) {
      this.copyControlTypes = this.$parent.selectedControls.map(
        (c: Control) => {
          return {
            Type: c.Type,
            attr: c.attr,
            props: c.props,
          };
        }
      );
      this.pasteN = 1;
    } else {
      this.copyControlTypes = null;
    }
  }
  vControl() {
    if (this.copyControlTypes?.length) {
      this.copyControlTypes.forEach((c) => {
        let attr = CloneInstance(c.attr);
        let props = CloneInstance(c.props);
        delete props["name"];
        delete props["top"];
        delete props["left"];
        attr.name.v = c.Type + this.Controls.length;
        (attr.top.v as number) += this.pasteN * 20;
        (attr.left.v as number) += this.pasteN * 20;
        this.Controls.push({
          Id: Guid(),
          attr,
          props,
          controlType: c.Type,
        });
      });
      this.pasteN++;
    }
  }
  aControl() {
    if (this.controlKeyActivate) {
      this.SelectControls(
        this.Controls.map((c) => c.attr.name.v.toString()),
        null
      );
      this.$nextTick(() => {
        this.$parent.selectedControls.forEach(
          (c: Control) =>
            (c.$refs["DragHelper"].moveType = DragHelperMoveType.None)
        );
      });
    }
  }

  controlKeyActivate = false;
  shiftKeyActivate = false;
  altKeyActivate = false;
  MonitorKey(e: KeyboardEvent) {
    let keyDown = e.type == "keydown";
    if (e.key == "Control") this.controlKeyActivate = keyDown ? true : false;
    if (e.key == "Shift") this.shiftKeyActivate = keyDown ? true : false;
    if (e.key == "Alt") this.altKeyActivate = keyDown ? true : false;
    if (keyDown) {
      let eventName = e.key + "Control";
      if (
        !GetPathByDom(e.target as HTMLElement).find((d: HTMLElement) =>
          d.classList ? d.classList[0] == "PropItem" : false
        ) &&
        (this as any)[eventName]
      )
        if (!this.selected || e.key == "a") (this as any)[eventName]();
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
  Justifying(type: JustifyingType) {
    this.$parent.selectedControls.forEach((c: Control) => {
      if (c.Id != this.prominentControlInstance.Id) {
        let offset = 0;
        switch (type) {
          case "right":
          case "verticalCenter":
            let proRight =
              (this.prominentControlInstance.props.left.v as number) +
              (this.prominentControlInstance.props.width.v as number);
            let currentCRight =
              (c.props.left.v as number) + (c.props.width.v as number);
            offset = proRight - currentCRight;
            if (type == "verticalCenter") {
              let proControlWidthOffset =
                (this.prominentControlInstance.props.width.v as number) / 2 -
                (c.props.width.v as number) / 2;
              offset -= proControlWidthOffset;
            }
            (c.props.left.v as number) += offset;
            break;
          case "bottom":
          case "horizontalCenter":
            let proBottom =
              (this.prominentControlInstance.props.top.v as number) +
              (this.prominentControlInstance.props.height.v as number);
            let currentCBottom =
              (c.props.top.v as number) + (c.props.height.v as number);
            offset = proBottom - currentCBottom;
            if (type == "horizontalCenter") {
              let proControlHeightOffset =
                (this.prominentControlInstance.props.height.v as number) / 2 -
                (c.props.height.v as number) / 2;
              offset -= proControlHeightOffset;
            }
            (c.props.top.v as number) += offset;
            break;
          default:
            c.props[type].v = this.prominentControlInstance.props[type].v;
            break;
        }
      }
    });
  }
  EqualSize(type: EqualType) {
    this.$parent.selectedControls.forEach((c: Control) => {
      if (c.Id != this.prominentControlInstance.Id) {
        switch (type) {
          case "widthAndHeight":
            c.props.width.v = this.prominentControlInstance.props.width.v;
            c.props.height.v = this.prominentControlInstance.props.height.v;
            break;
          default:
            c.props[type].v = this.prominentControlInstance.props[type].v;
            break;
        }
      }
    });
  }

  formContainerAreaRect = new DOMRect();
  formContainerAreaDom = null as any as HTMLElement;
  GlobalMenuControl(e: MouseEvent) {
    this.$store.commit("SetContextMenuPos", {
      top:
        e.y +
        this.formContainerAreaDom.scrollTop -
        this.formContainerAreaRect.y,
      left:
        e.x +
        this.formContainerAreaDom.scrollLeft -
        this.formContainerAreaRect.x,
    });
    if (
      GetPathByDom(e.target as HTMLElement).find(
        (d: HTMLElement) => d.id == "Control"
      )
    ) {
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
  LeaveCurrentPage(e: FocusEvent) {
    this.altKeyActivate = false;
    this.shiftKeyActivate = false;
    this.controlKeyActivate = false;
  }
  codeEditor: CodeEditor | undefined;
  created() {
    DocumentEventCenter.call(this, this.documentEvents);
    window.addEventListener("blur", this.LeaveCurrentPage);
    this.$nextTick(() => {
      this.formContainerAreaRect =
        this.$parent.$refs.FormContainerAreaDom.getBoundingClientRect();
      this.formContainerAreaDom = this.$parent.$refs.FormContainerAreaDom;
      this.formContainerDomRect =
        this.$refs.FormContainerDom.getBoundingClientRect();
      this.codeEditor = new CodeEditor(
        this.$refs["CodeEditingArea"],
        [
          "class PageForm implements Form {",
          "\tcontrols: { [x: string]: Control }",
          "}",
        ].join("\n"),
        this
      );
    });
  }

  unmounted() {
    window.removeEventListener("blur", this.LeaveCurrentPage);
    DocumentEventCenter.call(this, this.documentEvents, true);
  }
  showCodeEditingArea = false;
  @Watch("showCodeEditingArea")
  showCodeEditingAreaWatch(n: boolean, o: boolean) {
    if (!this.codeEditor?.Instance) {
      this.$nextTick(() => {
        this.codeEditor?.Builder();
      });
    }
    // this.$parent.GetAllEvents();
  }

  globalMenuControlItems = [
    {
      title: "查看代码",
      show: !this.showCodeEditingArea,
      onClick: () => (this.showCodeEditingArea = true),
    },
  ];

  prominentControlInstance: Control = null as any;
  ControlContextmenu(e: MouseEvent) {
    if (!this.$parent.selectedControls.length) return;
    let moveLevel = this.$parent.selectedControls.length == 1;
    let operationControls = this.$parent.selectedControls.filter(
      (c: Control | FormContainer) => !(c as FormContainer).SelectControls
    ).length;
    this.$store.commit("SetContextMenus", [
      ...this.globalMenuControlItems,
      {
        title: "置于顶层",
        show: operationControls,
        onClick: this.BringToFront,
      },
      {
        title: "置于底层",
        show: operationControls,
        onClick: this.AtTheBottom,
      },
      {
        title: "删除",
        show: operationControls,
        onClick: this.DeleteControl,
      },
      {
        title: "复制",
        show: operationControls,
        onClick: () => this.cControl(true),
      },
      {
        title: "粘贴",
        show: !!this.copyControlTypes?.length,
        onClick: this.vControl,
      },
      {
        title: "上移一层",
        show: moveLevel && operationControls,
        onClick: () => this.MoveUpALayerOf(true),
      },
      {
        title: "下移一层",
        show: moveLevel && operationControls,
        onClick: () => this.MoveUpALayerOf(),
      },
    ]);
  }
  SelectControls(cName: Array<string> | null, e: MouseEvent | null) {
    let Controls = [this];
    if (cName) {
      Controls = cName.map((c) => this.$refs[c]);
      let lastName = cName[cName.length - 1];
      this.prominentControlInstance = this.$refs[lastName];
    }
    this.$emit("SelectControl", Controls);
    this.$parent.HiddenMenu();
    e?.stopPropagation();
  }
  PressSelect(cName: string, e: MouseEvent) {
    let willControlArr = [cName];
    this.prominentControlInstance = this.$refs[cName];
    let currentSelectedControls = this.$parent.selectedControls.filter(
      (control: Control | FormContainer) => {
        if ((control as Control).Id) {
          if ((control as Control).Id == this.prominentControlInstance.Id) {
            control.$refs["DragHelper"].important = true;
          } else {
            control.$refs["DragHelper"].important = false;
          }
        }
        return !(control as FormContainer).SelectControls;
      }
    ) as Array<Control>;
    let currentSelectedControlNames = currentSelectedControls.map(
      (control: Control) => control.props.name.v.toString()
    );
    if (this.altKeyActivate) {
      currentSelectedControlNames = currentSelectedControlNames.filter(
        (control) => control != cName
      );
      this.SelectControls(currentSelectedControlNames, e);
    } else if (this.shiftKeyActivate) {
      willControlArr = [...currentSelectedControlNames, ...willControlArr];
      this.SelectControls(willControlArr, e);
    } else if (e.button == 0 && this.$parent.selectedControls.length <= 1) {
      this.SelectControls(willControlArr, e);
    } else {
      e.stopPropagation();
    }
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

  formContainerDomRect = new DOMRect();
  placeTime = 0;
  PlaceSelectFloatLayer(e: MouseEvent) {
    if (e.button != 0) return;
    this.placeTime = e.timeStamp;
    this.selectFloatLayerEnable = true;
    let x = Math.round(
      e.x + this.formContainerAreaDom.scrollLeft - this.formContainerDomRect.x
    );
    let y = Math.round(
      e.y + this.formContainerAreaDom.scrollTop - this.formContainerDomRect.y
    );
    this.originalCoordinates = {
      x,
      y,
    };
    this.selectFloatLayerAttr.top = y;
    this.selectFloatLayerAttr.left = x;
    this.selectFloatLayerAttr.width = 0;
    this.selectFloatLayerAttr.height = 0;
    e.stopPropagation();
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
      let currentX = Math.round(
        e.x + this.formContainerAreaDom.scrollLeft - this.formContainerDomRect.x
      );
      let currentY = Math.round(
        e.y + this.formContainerAreaDom.scrollTop - this.formContainerDomRect.y
      );
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

  GetTools() {
    let tools: Array<JSX.Element> = [];
    let manyControlShow =
      this.$parent.selectedControls.filter(
        (c: Control | FormContainer) => !(c as FormContainer).SelectControls
      ).length > 1;
    if (manyControlShow) {
      tools = [
        <div class="toolItem" onClick={() => this.Justifying("left")}>
          左对齐
        </div>,
        <div class="toolItem" onClick={() => this.Justifying("verticalCenter")}>
          垂直居中对齐
        </div>,
        <div class="toolItem" onClick={() => this.Justifying("right")}>
          右对齐
        </div>,
        <div class="toolItem" onClick={() => this.Justifying("top")}>
          顶部对齐
        </div>,
        <div
          class="toolItem"
          onClick={() => this.Justifying("horizontalCenter")}
        >
          横向居中对齐
        </div>,
        <div class="toolItem" onClick={() => this.Justifying("bottom")}>
          底部对齐
        </div>,
        <div class="toolItem" onClick={() => this.EqualSize("width")}>
          同宽
        </div>,
        <div class="toolItem" onClick={() => this.EqualSize("height")}>
          同高
        </div>,
        <div class="toolItem" onClick={() => this.EqualSize("widthAndHeight")}>
          同宽&同高
        </div>,
      ];
    }
    return tools;
  }

  render() {
    return (
      <>
        <div
          ref="CodeEditingArea"
          class="CodeEditingArea"
          v-show={this.showCodeEditingArea}
          onDblclick={() => this.codeEditor?.GetJavaScript()}
        ></div>
        <div class="tools">{...this.GetTools()}</div>
        <ContextMenu />
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
            default: () => {
              return (
                <div
                  style={this.Style}
                  id="FormContainer"
                  ref="FormContainerDom"
                  onContextmenu={this.ControlContextmenu}
                  onClick={(e: MouseEvent) => {
                    if (e.timeStamp - this.placeTime < 150) {
                      this.SelectControls(null, e);
                    }
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
                        attr={c.attr}
                        transmitProps={c.props}
                        style={"z-index:" + (i + 1)}
                        ref={c.attr.name.v}
                        controlType={c.controlType}
                        onClick={(e: MouseEvent) => e.stopPropagation()}
                        onMousedown={(e: MouseEvent) => {
                          this.PressSelect(c.attr.name.v.toString(), e);
                        }}
                      ></control>
                    );
                  })}
                </div>
              );
            },
          }}
        </DragHelper>
      </>
    );
  }
}
