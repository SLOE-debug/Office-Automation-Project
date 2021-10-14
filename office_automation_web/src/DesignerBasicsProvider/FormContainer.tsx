import { Options, Vue } from "vue-class-component";
import DragHelper from "./DragHelper";
import "@/assets/css/DesignerBasicsProvider/FormContainer.less";
import { Prop } from "vue-property-decorator";
import {
  CloneInstance,
  DocumentEventCenter,
  GetSuffix,
} from "@/Util/ControlCommonLib";
import {
  ContextMenuItemType,
  ControlItemType,
  PropItemType,
} from "@/Util/ControlCommonType";

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
      styleProp: true,
    },
    height: {
      lable: "高度",
      v: 500,
      des: "控件的高度",
      styleProp: true,
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
  };
  get Style() {
    let styleObj = {} as any;
    for (const k in this.props) {
      if (this.props[k].styleProp) styleObj[k] = this.props[k].v + GetSuffix(k);
    }
    return styleObj;
  }

  GetCurrentControlIndex() {
    return this.Controls.findIndex(
      (c) => c.attr.name.v == this.$parent.selectedControl.props.name.v
    );
  }

  selected = false;
  DeleteControl() {
    let ControlIndex = this.GetCurrentControlIndex();
    let RemoveControl = this.Controls.splice(ControlIndex, 1);
    this.$parent.selectedControl = null;
    return RemoveControl;
  }
  ArrowLeftControl() {
    this.$parent.selectedControl.props.left.v--;
  }
  ArrowRightControl() {
    this.$parent.selectedControl.props.left.v++;
  }
  ArrowUpControl() {
    this.$parent.selectedControl.props.top.v--;
  }
  ArrowDownControl() {
    this.$parent.selectedControl.props.top.v++;
  }
  copyControlType: string | null = null;
  cControl() {
    if (this.controlKeyActivate && this.$parent.selectedControl) {
      this.copyControlType = this.$parent.selectedControl.Type;
    } else {
      this.copyControlType = null;
    }
  }
  vControl() {
    if (this.copyControlType) {
      let attr = CloneInstance(this.$parent.selectedControl.attr) as {
        [x: string]: PropItemType;
      };
      attr.name.v = this.copyControlType + this.Controls.length;
      (attr.top.v as number) += 20;
      (attr.left.v as number) += 20;
      this.Controls.push({ attr, controlType: this.copyControlType });
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
    let RemoveControl = this.DeleteControl()[0];
    this.Controls.push(RemoveControl);
  }
  AtTheBottom() {
    let RemoveControl = this.DeleteControl()[0];
    this.Controls.unshift(RemoveControl);
  }
  MoveUpALayerOf(reversed: boolean = false) {
    let ControlIndex = this.GetCurrentControlIndex();
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

  GlobalMenuControl(e: MouseEvent) {
    let ContainerRect = this.$refs.FormContainerDom.getBoundingClientRect() as DOMRect;
    this.$store.commit("SetContextMenuPos", {
      top: e.y - ContainerRect.y,
      left: e.x - ContainerRect.x,
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
  };
  created() {
    DocumentEventCenter.call(this, this.documentEvents);
  }

  unmounted() {
    DocumentEventCenter.call(this, this.documentEvents, true);
  }

  ControlContextmenu(e: MouseEvent) {
    if (!this.$parent.selectedControl) return;
    this.$store.commit("SetContextMenus", [
      {
        title: "复制",
        onCilck: this.cControl,
      },
      {
        title: "粘贴",
        onCilck: this.vControl,
      },
      {
        title: "置于顶层",
        onCilck: this.BringToFront,
      },
      {
        title: "置于底层",
        onCilck: this.AtTheBottom,
      },
      {
        title: "上移一层",
        onCilck: () => this.MoveUpALayerOf(true),
      },
      {
        title: "下移一层",
        onCilck: () => this.MoveUpALayerOf(),
      },
    ]);
  }

  SelectControl(cName: string | null, e: MouseEvent) {
    let Control = this.selected ? (null as any) : this;
    if (cName) Control = this.$refs[cName!];
    this.$emit("SelectControl", Control);
    this.$parent.HiddenMenu();
    e.stopPropagation();
  }

  // console.log(
  //   JSON.stringify(
  //     this.Controls.map((c) => {
  //       return {
  //         t: c.controlType,
  //         a: Object.keys(c.attr).map((k) => {
  //           return { [k]: c.attr[k].v };
  //         }),
  //       };
  //     })
  //   )
  // );

  render() {
    return (
      <DragHelper
        {...{
          style: this.Style,
          tl: false,
          tr: false,
          bl: false,
          br: this.selected,
          props: this.props,
          CanMove: false,
        }}
      >
        {{
          default: () => (
            <>
              <div
                id="ControlContextMenu"
                style={{
                  top: this.$store.getters.ContextMenuPos.top + "px",
                  left: this.$store.getters.ContextMenuPos.left + "px",
                }}
              >
                {this.$store.getters.ContextMenus.map(
                  (m: ContextMenuItemType) => {
                    return (
                      <div class="ContextMenu" onClick={m.onCilck as any}>
                        {m.title}
                      </div>
                    );
                  }
                )}
              </div>
              <div
                style={this.Style}
                id="FormContainer"
                ref="FormContainerDom"
                onClick={(e: MouseEvent) => {
                  this.SelectControl(null, e);
                }}
              >
                {this.Controls.map((c, i) => {
                  let control = this.$.appContext.components[c.controlType];
                  return (
                    <control
                      onContextmenu={this.ControlContextmenu}
                      attr={c.attr}
                      style={"z-index:" + (i + 1)}
                      ref={c.attr.name.v}
                      key={c.attr.name.v}
                      controlType={c.controlType}
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                      }}
                      onMousedown={(e: MouseEvent) => {
                        if (e.button == 0)
                          this.SelectControl(c.attr.name.v.toString(), e);
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
