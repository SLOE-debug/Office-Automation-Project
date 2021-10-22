import { Options, Vue } from "vue-class-component";
import FormContainer from "@/DesignerBasicsProvider/FormContainer";
import "@/assets/css/views/FormDesigner.less";
import {
  Input as aInput,
  Select as aSelect,
  InputNumber,
  SelectOption,
  Textarea,
} from "ant-design-vue";
import {
  ControlItemType,
  dragActionType,
  DragType,
} from "@/Util/ControlCommonType";
import { DocumentEventCenter } from "@/Util/ControlCommonLib";
import { message } from "ant-design-vue";
import ColorPicker from "@/DesignerBasicsProvider/ColorPicker";

@Options({
  components: {
    InputNumber,
    aInput,
    aSelect,
    SelectOption,
    Textarea,
    ColorPicker,
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
      let cName = controlType + this.Controls.length;
      this.Controls.push({
        attr: {
          name: {
            lable: "名称",
            v: cName,
            des: "该控件的唯一名称",
            onChange: (e: InputEvent) => {
              if (
                this.Controls.filter(
                  (c) => c.attr.name.v == (e.target as HTMLInputElement).value
                ).length == 2
              ) {
                message.error({
                  content: "请勿和其他控件名称重名，该名称应该是唯一的！",
                  duration: 5,
                });
              }
            },
          },
          top: {
            lable: "上",
            v: top - 10,
            des: "该控件距窗体顶部距离",
            isStyle: true,
          },
          left: {
            lable: "左",
            v: left - 10,
            des: "该控件的距窗体左侧的距离",
            isStyle: true,
          },
        },
        controlType,
      });
      this.$nextTick(() => {
        this.selectedControl = this.$refs["FormContainer"].$refs[cName];
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
    this.HiddenMenu();
    this.ClearDragAction();
  }
  ClearDragAction() {
    this.dragAction = {
      type: DragType.None,
      controlType: "",
      serialNumber: -1,
    };
  }

  HiddenMenu() {
    this.$store.commit("SetContextMenus", []);
  }

  RollingIncrementOrDecrement(e: WheelEvent) {
    let target = e.target as HTMLInputElement;
    if (target.classList[0] == "ant-input-number-input") {
      // let step = target.attributes.getNamedItem("step");
      let n = 1;
      // if (step) {
      //   n = parseFloat(step.value);
      // }
      if (e.deltaY > 0) n = -n;
      let v = parseFloat(target.value).toFixed(2);
      target.value = (parseFloat(v) + n).toFixed(2);
      target.dispatchEvent(new Event("input"));
    }
  }

  documentEvents: { [x: string]: any } = {
    drop: this.DragComplete,
    dragover: (e: DragEvent) => {
      e.preventDefault();
    },
    click: this.HiddenMenu,
    mousewheel: this.RollingIncrementOrDecrement,
  };
  oldProp = {} as any;
  SelectPropItem(k: string, i: number) {
    this.selectedPropDes = this.selectedControl.props[k].des;
    if (this.oldProp) this.oldProp.selected = false;
    this.selectedControl.props[k].selected = true;
    this.oldProp = this.selectedControl.props[k];
  }

  WindowResize() {
    this.height = window.innerHeight;
  }
  created() {
    window.addEventListener("resize", this.WindowResize);
    DocumentEventCenter.call(this, this.documentEvents);
  }
  unmounted() {
    window.removeEventListener("resize", this.WindowResize);
    DocumentEventCenter.call(this, this.documentEvents, true);
  }

  GetPropsFormControls() {
    let propsFormControls: Array<JSX.Element> = [];
    propsFormControls = Object.keys(this.selectedControl.props).map((k, i) => {
      let minNumber = k == "left" || k == "top" ? -100000000 : 0;
      let minKey = "min" + k.charAt(0).toUpperCase() + k.slice(1);
      if (this.selectedControl.props[minKey])
        minNumber = this.selectedControl.props[minKey].v;

      let propDataType = typeof this.selectedControl.props[k].v as any;
      let propFormControl = <></>;

      switch (propDataType) {
        case "number":
          propFormControl = (
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
          );
          break;
        case "string":
          if (k == "text") {
            propFormControl = (
              <Textarea
                size="small"
                v-model={[this.selectedControl.props[k].v, "value"]}
                onChange={(e: InputEvent) => {
                  this.selectedControl.props[k].onChange &&
                    this.selectedControl.props[k].onChange(e);
                }}
              ></Textarea>
            );
          }
          if (this.selectedControl.props[k].isColor) {
            propFormControl = (
              <ColorPicker
                {...{
                  value: this.selectedControl.props[k].v,
                  onChange: (e: string) =>
                    (this.selectedControl.props[k].v = e),
                  key: this.selectedControl.props.name?.v + k,
                }}
              ></ColorPicker>
            );
          } else {
            propFormControl = (
              <aInput
                size="small"
                v-model={[this.selectedControl.props[k].v, "value"]}
                onChange={(e: InputEvent) => {
                  this.selectedControl.props[k].onChange &&
                    this.selectedControl.props[k].onChange(e);
                }}
              ></aInput>
            );
          }
          break;
        case "object":
          propFormControl = (
            <aSelect
              v-model={[this.selectedControl.props[k].dataValue, "value"]}
              size="small"
              allowClear
            >
              {Object.keys(this.selectedControl.props[k].v).map((pk) => (
                <SelectOption value={this.selectedControl.props[k].v[pk]}>
                  {pk}
                </SelectOption>
              ))}
            </aSelect>
          );
          break;
      }
      return (
        <div
          class={
            "PropItem" +
            (this.selectedControl.props[k].selected ? " ActivatePropItem" : "")
          }
          onMouseenter={() => {
            this.SelectPropItem(k, i);
          }}
        >
          <div class="lable">{this.selectedControl.props[k].lable}</div>
          <div class="content">{propFormControl}</div>
        </div>
      );
    });
    return propsFormControls;
  }

  render() {
    let props: Array<JSX.Element> = [];
    if (this.selectedControl) {
      props = this.GetPropsFormControls();
    }

    return (
      <div style={`height:${this.height}px`} id="DesignerWindow">
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
