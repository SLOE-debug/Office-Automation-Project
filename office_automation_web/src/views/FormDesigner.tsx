import { Options, Vue } from "vue-class-component";
import FormContainer from "@/DesignerBasicsProvider/FormContainer";
import "@/assets/css/views/FormDesigner.less";
import {
  Input as aInput,
  Select as aSelect,
  InputNumber,
  SelectOption,
  Textarea,
  Switch,
} from "ant-design-vue";
import {
  ControlItemType,
  dragActionType,
  DragType,
} from "@/Util/ControlCommonType";
import { DocumentEventCenter, Guid } from "@/Util/ControlCommonLib";
import { message } from "ant-design-vue";
import ColorPicker from "@/DesignerBasicsProvider/ColorPicker";
import Control from "@/DesignerBasicsProvider/Control";

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
    selectedControls(n: Array<any>, o: Array<any>) {
      o.forEach((c) => {
        c.selected = false;
        if (c.$refs["DragHelper"]) c.$refs["DragHelper"].important = false;
      });
      n.forEach((c, i) => {
        c.selected = true;
        if (i == n.length - 1 && c.$refs["DragHelper"])
          c.$refs["DragHelper"].important = true;
      });
      this.selectedPropDes = "";
    },
  },
})
export default class FormDesigner extends Vue {
  selectedControls: Array<Control> = [];
  selectedPropDes = "";
  height = window.innerHeight;
  dragAction: dragActionType = {
    type: DragType.None,
    controlType: "",
    serialNumber: -1,
  };
  Controls: Array<ControlItemType> = [];

  get CurrentSelectedControl() {
    if (this.selectedControls.length) {
      return this.selectedControls[0];
    } else {
      return null;
    }
  }

  PlaceControl(e: DragEvent) {
    let target = e.target as HTMLElement;
    let isDragHelper = target.parentElement?.id == "FormContainer";
    if (isDragHelper) target = target.parentElement!;
    if (target.id == "FormContainer" || isDragHelper) {
      let { left, top } = this.GetNewPosition(target, e);
      let controlType = this.dragAction.controlType;
      let cName = controlType + this.Controls.length;
      this.Controls.push({
        Id: Guid(),
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
        this.selectedControls = [this.$refs["FormContainer"].$refs[cName]];
      });
    }
  }

  GetNewPosition(target: HTMLElement, e: DragEvent) {
    let originalPosition = target.getBoundingClientRect();
    return {
      left: Math.round(e.x - originalPosition.x),
      top: Math.round(e.y - originalPosition.y),
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
      e.stopPropagation();
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
    this.selectedPropDes = this.CurrentSelectedControl!.props[k].des;
    if (this.oldProp) this.oldProp.selected = false;
    this.CurrentSelectedControl!.props[k].selected = true;
    this.oldProp = this.CurrentSelectedControl!.props[k];
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
    if (this.selectedControls.length != 1) return propsFormControls;

    propsFormControls = Object.keys(this.CurrentSelectedControl!.props).map(
      (k, i) => {
        let minNumber = k == "left" || k == "top" ? -100000000 : 0;
        let minKey = "min" + k.charAt(0).toUpperCase() + k.slice(1);
        if (this.CurrentSelectedControl!.props[minKey])
          minNumber = this.CurrentSelectedControl!.props[minKey].v as number;

        let propDataType = typeof this.CurrentSelectedControl!.props[k].v;
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
                  if (v == undefined || v == null || v < minNumber)
                    this.CurrentSelectedControl!.props[k].v = minNumber;
                }}
                v-model={[this.CurrentSelectedControl!.props[k].v, "value"]}
              />
            );
            break;
          case "string":
            if (this.CurrentSelectedControl!.props[k].isTextarea) {
              propFormControl = (
                <Textarea
                  size="small"
                  v-model={[this.CurrentSelectedControl!.props[k].v, "value"]}
                  onChange={(e: InputEvent) => {
                    this.CurrentSelectedControl!.props[k].onChange &&
                      this.CurrentSelectedControl!.props[k].onChange!(e);
                  }}
                ></Textarea>
              );
            } else if (this.CurrentSelectedControl!.props[k].isColor) {
              propFormControl = (
                <ColorPicker
                  {...{
                    value: this.CurrentSelectedControl!.props[k].v,
                    onChange: (e: string) =>
                      (this.CurrentSelectedControl!.props[k].v = e),
                  }}
                ></ColorPicker>
              );
            } else {
              propFormControl = (
                <aInput
                  size="small"
                  v-model={[this.CurrentSelectedControl!.props[k].v, "value"]}
                  onChange={(e: InputEvent) => {
                    this.CurrentSelectedControl!.props[k].onChange &&
                      this.CurrentSelectedControl!.props[k].onChange!(e);
                  }}
                ></aInput>
              );
            }
            break;
          case "object":
            propFormControl = (
              <aSelect
                v-model={[
                  this.CurrentSelectedControl!.props[k].dataValue,
                  "value",
                ]}
                size="small"
                allowClear
              >
                {Object.keys(this.CurrentSelectedControl!.props[k].v).map(
                  (pk) => (
                    <SelectOption
                      value={
                        (this.CurrentSelectedControl!.props[k].v as any)[pk]
                      }
                    >
                      {pk}
                    </SelectOption>
                  )
                )}
              </aSelect>
            );
            break;
          case "boolean":
            propFormControl = (
              <Switch
                v-model={[this.CurrentSelectedControl!.props[k].v, "checked"]}
                checkedChildren={"开"}
                unCheckedChildren={"关"}
              ></Switch>
            );
            break;
        }
        return (
          <div
            class={
              "PropItem" +
              (this.CurrentSelectedControl!.props[k].selected
                ? " ActivatePropItem"
                : "")
            }
            onMouseenter={() => {
              this.SelectPropItem(k, i);
            }}
          >
            <div class="lable">
              {this.CurrentSelectedControl!.props[k].lable}
            </div>
            <div class="content" key={this.CurrentSelectedControl!.Id}>
              {propFormControl}
            </div>
          </div>
        );
      }
    );
    return propsFormControls;
  }

  render() {
    let props: Array<JSX.Element> = this.GetPropsFormControls();
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
        <div id="FormContainerArea" ref="FormContainerAreaDom">
          <FormContainer
            {...{
              Controls: this.Controls,
              ref: "FormContainer",
              onSelectControl: (controls: any) => {
                this.selectedControls = controls;
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
