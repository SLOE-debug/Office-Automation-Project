import { Options, Vue } from "vue-class-component";
import FormContainer from "@/DesignerBasicsProvider/FormContainer";
import "@/assets/css/views/FormDesigner.less";
import {
  Input as aInput,
  Select as aSelect,
  InputNumber,
  Switch,
  message,
} from "ant-design-vue";
import {
  ControlItemType,
  dragActionType,
  DragType,
  EventItemType,
  SelectItemType,
} from "@/Util/ControlCommonType";
import { DocumentEventCenter, Guid } from "@/Util/ControlCommonLib";
import ColorPicker from "@/DesignerBasicsProvider/ColorPicker";
import Control from "@/DesignerBasicsProvider/Control";
import { gsap } from "gsap";

@Options({
  components: {
    InputNumber,
    aInput,
    aSelect,
    ColorPicker,
  },
  watch: {
    selectedControls(n: Array<Control>, o: Array<Control>) {
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
  selectedItemDes = "";
  height = window.innerHeight;
  dragAction: dragActionType = {
    type: DragType.None,
    controlType: "",
    serialNumber: -1,
  };
  controls: Array<ControlItemType> = [
    {
      Id: Guid(),
      attr: {
        name: {
          lable: "名称",
          v: "btn_1",
          des: "该控件的唯一名称",
          onChange: this.VerifyName,
        },
        top: {
          lable: "上",
          v: 10,
          des: "该控件距窗体顶部距离",
          isStyle: true,
        },
        left: {
          lable: "左",
          v: 10,
          des: "该控件的距窗体左侧的距离",
          isStyle: true,
        },
      },
      controlType: "Button",
    },
  ];

  get CurrentSelectedControl() {
    if (this.selectedControls.length) {
      return this.selectedControls[0];
    } else {
      return null;
    }
  }

  VerifyName(e: InputEvent) {
    if (
      this.controls.filter(
        (c) => c.attr.name.v == (e.target as HTMLInputElement).value
      ).length == 2
    ) {
      message.error({
        content: "请勿和其他控件名称重名，该名称应该是唯一的！",
        duration: 5,
      });
    }
  }

  PlaceControl(e: DragEvent) {
    let target = e.target as HTMLElement;
    let isDragHelper = target.parentElement?.id == "FormContainer";
    if (isDragHelper) target = target.parentElement!;

    if (target.id == "FormContainer" || isDragHelper) {
      let { left, top } = this.GetNewPosition(target, e);
      let controlType = this.dragAction.controlType;
      let cName = controlType + this.controls.length;
      this.controls.push({
        Id: Guid(),
        attr: {
          name: {
            lable: "名称",
            v: cName,
            des: "该控件的唯一名称",
            onChange: this.VerifyName,
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
    }
  }

  documentEvents: { [x: string]: Function } = {
    drop: this.DragComplete,
    dragover: (e: DragEvent) => {
      e.preventDefault();
    },
    click: this.HiddenMenu,
    mousewheel: this.RollingIncrementOrDecrement,
  };
  oldItem = {} as any;
  SelectItem(k: string, selectItemType: SelectItemType) {
    let Items = (this.CurrentSelectedControl as any)[selectItemType];
    this.selectedItemDes = Items[k].des;
    if (this.oldItem) this.oldItem.selected = false;
    Items[k].selected = true;
    this.oldItem = Items[k];
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

  GetPropsForControls() {
    let propsForControls: Array<JSX.Element> = [];
    if (this.selectedControls.length != 1) return propsForControls;
    if (this.CurrentSelectedControl && this.selectedControls.length == 1) {
      propsForControls = Object.keys(this.CurrentSelectedControl.props)
        .filter((k) => !this.CurrentSelectedControl?.props[k].isHidden)
        .map((k) => {
          if (this.CurrentSelectedControl) {
            let m = this.CurrentSelectedControl.props[k];
            let minNumber = k == "left" || k == "top" ? -100000000 : 0;
            let minKey = "min" + k.charAt(0).toUpperCase() + k.slice(1);
            if (this.CurrentSelectedControl.props[minKey])
              minNumber = this.CurrentSelectedControl.props[minKey].v as number;

            let propDataType = typeof m.v;
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
                        m.v = minNumber;
                    }}
                    v-model={[m.v, "value"]}
                  />
                );
                break;
              case "string":
                if (m.isTextarea) {
                  propFormControl = (
                    <aInput.TextArea
                      size="small"
                      v-model={[m.v, "value"]}
                      onChange={(e: InputEvent) => {
                        m.onChange && m.onChange!(e);
                      }}
                    ></aInput.TextArea>
                  );
                } else if (m.isColor) {
                  propFormControl = (
                    <ColorPicker
                      {...{
                        value: m.v,
                        onChange: (e: string) => (m.v = e),
                      }}
                    ></ColorPicker>
                  );
                } else {
                  propFormControl = (
                    <aInput
                      size="small"
                      v-model={[m.v, "value"]}
                      onChange={(e: InputEvent) => {
                        m.onChange && m.onChange!(e);
                      }}
                    ></aInput>
                  );
                }
                break;
              case "object":
                propFormControl = (
                  <aSelect
                    v-model={[m.dataValue, "value"]}
                    size="small"
                    allowClear
                  >
                    {Object.keys(m.v).map((pk) => (
                      <aSelect.Option value={(m.v as any)[pk]}>
                        {pk}
                      </aSelect.Option>
                    ))}
                  </aSelect>
                );
                break;
              case "boolean":
                propFormControl = (
                  <Switch
                    v-model={[m.v, "checked"]}
                    checkedChildren={"开"}
                    unCheckedChildren={"关"}
                  ></Switch>
                );
                break;
            }
            return (
              <div
                class={"PropItem" + (m.selected ? " ActivateItem" : "")}
                onMouseenter={() => {
                  this.SelectItem(k, SelectItemType.Prop);
                }}
              >
                <div class="lable">{m.lable}</div>
                <div class="content" key={this.CurrentSelectedControl.Id}>
                  {propFormControl}
                </div>
              </div>
            );
          }
        }) as Array<JSX.Element>;
    }
    return propsForControls;
  }

  GetEventsForControls() {
    let eventForControls: Array<JSX.Element> = [];
    if (this.CurrentSelectedControl && this.selectedControls.length == 1) {
      eventForControls = Object.keys(this.CurrentSelectedControl.events).map(
        (k) => (
          <div
            class={
              "EventItem" +
              (this.CurrentSelectedControl!.events[k].selected
                ? " ActivateItem"
                : "")
            }
            onMouseenter={() => {
              this.SelectItem(k, SelectItemType.Event);
            }}
          >
            <div class="lable">
              {this.CurrentSelectedControl?.events[k].lable}
            </div>
            <div
              class="content"
              onDblclick={() => {
                this.AddEvents(this.CurrentSelectedControl?.events[k]!, k);
              }}
            >
              <a-select
                v-model={[this.CurrentSelectedControl!.events[k].v, "value"]}
                options={this.allEvents}
                size="small"
                allowClear
                show-search
              ></a-select>
            </div>
          </div>
        )
      );
    }
    return eventForControls;
  }

  Preview(e: MouseEvent) {
    return;
    this.controls.forEach((c) => {
      console.log(
        this.$refs["FormContainer"].$refs[c.attr.name.v.toString()].props
      );
    });
    e.stopPropagation();
  }

  async GetAllEvents() {
    this.allEvents = (
      await this.$refs["FormContainer"].codeEditor?.GetAllEvents()
    )?.map((e: string) => {
      return { label: e, value: e };
    });
  }

  controlBehaviorOffset = 0;
  allEvents: Array<{ label: string; value: string }> = [];
  ChangeControlBehavior(n: number) {
    this.controlBehaviorOffset = n;
    if (n) this.GetAllEvents();
    gsap.to(".ControlProps", {
      duration: 0.5,
      ease: "power1.inOut",
      marginLeft: n ? -this.$refs["BehaviorContent"].scrollWidth : 0,
    });
  }

  AddEvents(itemInfo: EventItemType, eventType: string) {
    if (!!itemInfo.v) return;
    let eventName = `${
      this.CurrentSelectedControl?.props.name.v
    }_${eventType.substr(2)}`;
    let eventBlock = `\tprivate ${eventName}(sender: object, e: Event) {\n\n\t}`;
    if (!this.$refs["FormContainer"].showCodeEditingArea)
      this.$refs["FormContainer"].showCodeEditingArea = true;
    setTimeout(() => {
      if (this.$refs["FormContainer"].codeEditor.addLine(eventBlock)) {
        this.GetAllEvents();
        itemInfo.v = eventName;
      } else {
        message.error("未成功添加事件，无法定位到添加点。", 3);
      }
    }, 0);
  }

  render() {
    let props: Array<JSX.Element> = this.GetPropsForControls();
    return (
      <div style={`height:${this.height}px`} id="DesignerWindow">
        <div class="ControlList">
          <div class="Tools">
            <div
              class="ToolsItem"
              style="background-color:#868b8d"
              onClick={this.Preview}
            >
              预览
            </div>
          </div>
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
              Controls: this.controls,
              ref: "FormContainer",
              onSelectControl: (controls: Array<Control>) => {
                this.selectedControls = controls;
              },
            }}
          ></FormContainer>
        </div>
        <div class="ControlBehavior">
          <div class="Toggle">
            <div
              class={`ToggleItem ${this.controlBehaviorOffset ? "" : "active"}`}
              onClick={() => this.ChangeControlBehavior(0)}
            >
              属性
            </div>
            <div
              class={`ToggleItem ${this.controlBehaviorOffset ? "active" : ""}`}
              onClick={() => this.ChangeControlBehavior(1)}
            >
              事件
            </div>
          </div>
          <div class="BehaviorContent" ref="BehaviorContent">
            <div class="ControlProps">
              <div>{...props}</div>
            </div>
            <div class="ControlEvents">{...this.GetEventsForControls()}</div>
          </div>
        </div>
        <div id="propDes">{this.selectedItemDes}</div>
      </div>
    );
  }
}
