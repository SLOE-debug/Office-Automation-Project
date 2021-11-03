import { Options, Vue } from "vue-class-component";
import DragHelper from "./DragHelper";
import "@/assets/css/DesignerBasicsProvider/FormContainer.less";
import { Prop } from "vue-property-decorator";
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
  JustifyingType,
  PropItemType,
} from "@/Util/ControlCommonType";
import ContextMenu from "./ContextMenu";
import Control from "./Control";
import { CodeEditor } from "./codeEditor";

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
  copyControlTypes: Array<{
    Type: string;
    attr: { [x: string]: PropItemType };
    props: { [x: string]: PropItemType };
  }> | null = null;
  PasteN = 1;
  cControl(compulsive: boolean = false) {
    if (
      (this.controlKeyActivate && this.$parent.selectedControls.length) ||
      compulsive
    ) {
      this.copyControlTypes = this.$parent.selectedControls.map((c: any) => {
        return {
          Type: c.Type,
          attr: c.attr,
          props: c.props,
        };
      });
      this.PasteN = 1;
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
        (attr.top.v as number) += this.PasteN * 20;
        (attr.left.v as number) += this.PasteN * 20;
        this.Controls.push({
          Id: Guid(),
          attr,
          props,
          controlType: c.Type,
        });
      });
      this.PasteN++;
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

  FormContainerAreaRect = new DOMRect();
  FormContainerAreaDom = null as any as HTMLElement;
  GlobalMenuControl(e: MouseEvent) {
    this.$store.commit("SetContextMenuPos", {
      top:
        e.y +
        this.FormContainerAreaDom.scrollTop -
        this.FormContainerAreaRect.y,
      left:
        e.x +
        this.FormContainerAreaDom.scrollLeft -
        this.FormContainerAreaRect.x,
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
      this.FormContainerAreaRect =
        this.$parent.$refs.FormContainerAreaDom.getBoundingClientRect();
      this.FormContainerAreaDom = this.$parent.$refs.FormContainerAreaDom;
      this.FormContainerDomRect =
        this.$refs.FormContainerDom.getBoundingClientRect();
      this.codeEditor = new CodeEditor(
        this.$refs["CodeEditingArea"],
        [
          "// 双击编辑器将使它执行",
          "class PageForm implements Form {",
          "\tcontrols: { [x: string]: Control }",
          "\tbtn1_Click(data: any, e: Event) {",
          "\t\tconsole.log(data,e)",
          "\t\tthis.controls['btn'].width.v = 10",
          "\t}",
          "}",
        ].join("\n")
      );
    });
  }

  unmounted() {
    window.removeEventListener("blur", this.LeaveCurrentPage);
    DocumentEventCenter.call(this, this.documentEvents, true);
  }

  prominentControlInstance: Control = null as any;
  ControlContextmenu(e: MouseEvent) {
    if (!this.$parent.selectedControls.length) return;
    let moveLevel = this.$parent.selectedControls.length == 1;
    let operationControls = this.$parent.selectedControls.filter(
      (c: any) => !c.SelectControls
    ).length;
    this.$store.commit("SetContextMenus", [
      {
        title: "置于顶层",
        onClick: this.BringToFront,
      },
      {
        title: "置于底层",
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
        show: moveLevel,
        onClick: () => this.MoveUpALayerOf(true),
      },
      {
        title: "下移一层",
        show: moveLevel,
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
      (control: any) => {
        if (control.Id) {
          if (control.Id == this.prominentControlInstance.Id) {
            control.$refs["DragHelper"].important = true;
          } else {
            control.$refs["DragHelper"].important = false;
          }
        }
        return !control.SelectControls;
      }
    );
    let currentSelectedControlNames = currentSelectedControls.map(
      (control: Control) => control.props.name.v.toString()
    ) as Array<string>;
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

  FormContainerDomRect = new DOMRect();
  PlaceSelectFloatLayerTime = 0;
  PlaceSelectFloatLayer(e: MouseEvent) {
    this.PlaceSelectFloatLayerTime = e.timeStamp;
    this.selectFloatLayerEnable = true;
    let x = Math.round(
      e.x + this.FormContainerAreaDom.scrollLeft - this.FormContainerDomRect.x
    );
    let y = Math.round(
      e.y + this.FormContainerAreaDom.scrollTop - this.FormContainerDomRect.y
    );
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
      let currentX = Math.round(
        e.x + this.FormContainerAreaDom.scrollLeft - this.FormContainerDomRect.x
      );
      let currentY = Math.round(
        e.y + this.FormContainerAreaDom.scrollTop - this.FormContainerDomRect.y
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

  render() {
    let manyControlShow =
      this.$parent.selectedControls.filter((c: any) => !c.SelectControls)
        .length > 1;
    return (
      <>
        <div
          ref="CodeEditingArea"
          class="CodeEditingArea"
          style="display:none"
        ></div>
        <div class="tools">
          <div
            class="toolItem"
            v-show={manyControlShow}
            onClick={() => this.Justifying("left")}
          >
            左对齐
          </div>
          <div
            class="toolItem"
            v-show={manyControlShow}
            onClick={() => this.Justifying("verticalCenter")}
          >
            垂直居中对齐
          </div>
          <div
            class="toolItem"
            v-show={manyControlShow}
            onClick={() => this.Justifying("right")}
          >
            右对齐
          </div>
          <div
            class="toolItem"
            v-show={manyControlShow}
            onClick={() => this.Justifying("top")}
          >
            顶部对齐
          </div>
          <div
            class="toolItem"
            v-show={manyControlShow}
            onClick={() => this.Justifying("horizontalCenter")}
          >
            横向居中对齐
          </div>
          <div
            class="toolItem"
            v-show={manyControlShow}
            onClick={() => this.Justifying("bottom")}
          >
            底部对齐
          </div>
          <div
            class="toolItem"
            v-show={manyControlShow}
            onClick={() => this.EqualSize("width")}
          >
            同宽
          </div>
          <div
            class="toolItem"
            v-show={manyControlShow}
            onClick={() => this.EqualSize("height")}
          >
            同高
          </div>
          <div
            class="toolItem"
            v-show={manyControlShow}
            onClick={() => this.EqualSize("widthAndHeight")}
          >
            同宽&同高
          </div>
        </div>
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
            default: () => (
              <>
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
                        onClick={(e: MouseEvent) => e.stopPropagation()}
                        onMousedown={(e: MouseEvent) => {
                          this.PressSelect(c.attr.name.v.toString(), e);
                        }}
                      ></control>
                    );
                  })}
                </div>
              </>
            ),
          }}
        </DragHelper>
      </>
    );
  }
}
