import { Options, Vue } from "vue-class-component";
import FormContainer from "@/DesignerBasicsProvider/FormContainer";
import "@/assets/css/views/FormDesigner.less";
import { InputNumber } from "ant-design-vue";
import { Input as aInput } from "ant-design-vue";
import {
  ControlItemType,
  dragActionType,
  DragType,
} from "@/Util/ControlCommonType";

@Options({
  components: {
    InputNumber,
    aInput,
  },
  watch: {
    selectedControl(n, o) {
      if (n) {
        n.selected = true;
      } else {
        this.selectedPropDes = "";
      }
      if (o) o.selected = false;
    },
  },
})
export default class FormDesigner extends Vue {
  selectedControl = null as any;
  selectedPropDes = "";
  propSelectedState: Array<boolean> = [];
  height = window.innerHeight;
  dragAction: dragActionType = {
    type: DragType.None,
    controlType: "",
    serialNumber: -1,
  };
  Controls: Array<ControlItemType> = [];

  PlaceControl(e: DragEvent) {
    let target = e.target as HTMLElement;
    let isDragHelper = target.parentElement?.id == "FormContainer";
    if (isDragHelper) target = target.parentElement!;
    if (target.id == "FormContainer" || isDragHelper) {
      let { left, top } = this.GetNewPosition(target, e);
      let controlType = this.dragAction.controlType;
      this.Controls.push({
        attr: {
          top: {
            lable: "上",
            v: top - 10,
            des: "该控件距窗体顶部距离",
            styleProp: true,
          },
          left: {
            lable: "左",
            v: left - 10,
            des: "该控件的距窗体左侧的距离",
            styleProp: true,
          },
        },
        controlType,
      });
      this.$nextTick(() => {
        let controlName = controlType + (this.Controls.length - 1);
        this.selectedControl = this.$refs["FormContainer"].$refs[controlName];
      });
    }
  }

  GetNewPosition(target: HTMLElement, e: DragEvent) {
    let originalPosition = target.getBoundingClientRect();
    return {
      left: parseFloat((e.x - originalPosition.x).toFixed(2)),
      top: parseFloat((e.y - originalPosition.y).toFixed(2)),
    };
  }

  DragComplete(e: DragEvent) {
    e.preventDefault();
    (this as any)[this.dragAction.type.toString() + "Control"](e);
    this.ClearDragAction();
  }
  ClearDragAction() {
    this.dragAction = {
      type: DragType.None,
      controlType: "",
      serialNumber: -1,
    };
  }
  documentEvents: { [x: string]: any } = {
    drop: this.DragComplete,
    dragover: (e: DragEvent) => {
      e.preventDefault();
    },
  };
  SelectPropItem(k: string, i: number) {
    this.selectedPropDes = this.selectedControl.props[k].des;
    for (let i = 0; i < this.propSelectedState.length; i++) {
      this.propSelectedState[i] = false;
    }
    this.propSelectedState[i] = true;
  }

  WindowResize() {
    this.height = window.innerHeight;
  }
  MountEvent(Unmount: boolean = false) {
    for (const envenType in this.documentEvents) {
      document[Unmount ? "removeEventListener" : "addEventListener"](
        envenType,
        this.documentEvents[envenType].bind(this)
      );
    }
  }
  created() {
    window.addEventListener("resize", this.WindowResize);
    this.MountEvent();
  }
  unmounted() {
    window.removeEventListener("resize", this.WindowResize);
    this.MountEvent(true);
  }
  render() {
    let props: Array<JSX.Element> = [];
    if (this.selectedControl) {
      props = Object.keys(this.selectedControl.props).map((k, i) => {
        this.propSelectedState.push(false);
        let minKey = "min" + k.charAt(0).toUpperCase() + k.slice(1);
        let PropItemClass = "PropItem";
        if (this.propSelectedState[i]) PropItemClass += " ActivatePropItem";
        let minNumber = 0;
        if (this.selectedControl.props[minKey])
          minNumber = this.selectedControl.props[minKey].v;
        return (
          <div
            class={PropItemClass}
            onMouseenter={() => {
              this.SelectPropItem(k, i);
            }}
          >
            <div class="lable">{this.selectedControl.props[k].lable}</div>
            <div class="content">
              {typeof this.selectedControl.props[k].v == "number" ? (
                <InputNumber
                  size="small"
                  min={minNumber}
                  step={0.1}
                  precision={2}
                  onChange={(v) => {
                    if (!v) this.selectedControl.props[k].v = minNumber;
                  }}
                  v-model={[this.selectedControl.props[k].v, "value"]}
                />
              ) : (
                <aInput
                  size="small"
                  v-model={[this.selectedControl.props[k].v, "value"]}
                ></aInput>
              )}
            </div>
          </div>
        );
      });
    }

    return (
      <div
        style={`height:${this.height}px`}
        id="DesignerWindow"
        onDblclick={() => (this.selectedControl = null)}
      >
        <div class="ControlList">
          {this.$ControlList.map((c) => (
            <div
              class="ClItem"
              draggable="true"
              onDragstart={() => {
                this.dragAction = {
                  type: DragType.Place,
                  controlType: c,
                };
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div id="FormContainerArea">
          <FormContainer
            {...{
              Controls: this.Controls,
              ref: "FormContainer",
              onSelectControl: (control: any) => {
                this.selectedControl = control;
              },
            }}
          ></FormContainer>
        </div>
        <div class="ControlProps">{...props}</div>
        <div id="propDes">{this.selectedPropDes}</div>
      </div>
    );
  }
}
