import { Options, Vue } from "vue-class-component";
import FormContainer from "@/DesignerBasicsProvider/FormContainer";
import "@/assets/css/views/FormDesigner.less";
import { InputNumber } from "ant-design-vue";
import { Input as aInput } from "ant-design-vue";

enum DragType {
  place,
  move,
  none,
}

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
  dragAction = {
    type: DragType.none,
    controlType: "",
  };
  Controls: Array<any> = [];

  DragComplete(e: DragEvent) {
    e.preventDefault();
    let target = e.target as HTMLElement;
    if (
      target.id == "FormContainer" ||
      target.parentElement?.id == "FormContainer"
    ) {
      let originalPosition = target.getBoundingClientRect();
      let left = parseFloat((e.x - originalPosition.x).toFixed(2));
      let top = parseFloat((e.y - originalPosition.y).toFixed(2));
      this.Controls.push({
        control: this.$.appContext.components[this.dragAction.controlType],
        attr: {
          top: {
            lable: "上",
            v: top,
            des: "该控件距窗体顶部距离",
          },
          left: {
            lable: "左",
            v: left,
            des: "该控件的距窗体左侧的距离",
          },
        },
        controlType: this.dragAction.controlType,
      });
    }
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
        let minNumber = 5;
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
                  type: DragType.place,
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
