import { Options, Vue } from "vue-class-component";
// import "@/assets/css/views/FormDesigner.less";
import { Input as aInput } from "ant-design-vue";

type DragType = "place" | "move";

@Options({
  components: {
    aInput,
  },
})
export default class FormDesigner extends Vue {
  CorrectDragPosition = false;
  CurrentDragInfo = {
    Name: "",
    Type: "" as DragType,
  };
  Controls: Array<any> = [];
  FormRect: DOMRect = null as any;
  FormDesignerEvents: { [x: string]: any } = {
    dragstart: this.DragControlStart,
    dragend: this.DragControlEnd,
    dragover: this.DragControlOver,
    dragenter: this.DragControlIntoForm,
    dragleave: this.DragControlLeaveForm,
    drop: this.DragControlComplete,
    keyup: this.KeysMonitor,
  };
  CurrentControlInfo = {
    refName: "",
    Control: null as any,
  };
  DeleteControl() {
    // console.log(this.CurrentControlInfo.refName.replace());

    console.log(this.Controls);
  }
  KeysMonitor(e: KeyboardEvent) {
    if (this.CurrentControlInfo.Control) {
      (this as any)[`${e.code}Control`]();
    }
  }
  DragControlStart(e: DragEvent) {
    let target = e.target as HTMLElement;
    if (!target.draggable) {
      e.preventDefault();
      return false;
    }
    target.style.opacity = "0.5";
  }
  DragControlEnd(e: DragEvent) {
    (e.target as HTMLElement).style.opacity = "";
    this.$forceUpdate();
  }
  DragControlOver(e: DragEvent) {
    e.preventDefault();
  }
  DragControlIntoForm(e: DragEvent) {
    let target = e.target as HTMLElement;
    if (target.id == "Form") {
      this.CorrectDragPosition = true;
    }
  }
  DragControlLeaveForm(e: DragEvent) {
    let target = e.target as HTMLElement;
    if (target.id == "Form") {
      this.CorrectDragPosition = false;
    }
  }
  GetPosition(e: DragEvent) {
    return {
      top: e.y - this.FormRect.y,
      left: e.x - this.FormRect.x,
    };
  }
  DragControlComplete(e: DragEvent) {
    e.preventDefault();
    let { Name, Type } = this.CurrentDragInfo;
    if (this.CorrectDragPosition) {
      switch (Type) {
        case "place":
          this.PlaceControl(Name, e);
          break;
        case "move":
          this.Controls[
            parseInt(Name.replace("C", ""))
          ].props._position = this.GetPosition(e);
          break;
        default:
          break;
      }
      this.ClearDragInfo();
    }
  }
  unSelectAllControls() {
    for (const key in this.$refs) {
      if (key[0] == "C") {
        this.$refs[key].Actived = false;
      }
    }
  }
  created() {
    this.RegisteredDragEvents();
    this.$nextTick(() => {
      this.FormRect = document.getElementById("Form")!.getBoundingClientRect();
    });
  }
  unmounted() {
    this.RegisteredDragEvents(true);
  }
  RegisteredDragEvents(destroy: boolean = false) {
    for (const EventType in this.FormDesignerEvents) {
      document[destroy ? "removeEventListener" : "addEventListener"](
        EventType,
        this.FormDesignerEvents[EventType].bind(this)
      );
    }
  }
  SelectControl(refName: string) {
    this.unSelectAllControls();
    this.$refs[refName].Actived = true;
    this.CurrentControlInfo = {
      Control: this.$refs[refName],
      refName,
    };
  }
  PlaceControl(Name: string, e: DragEvent) {
    let control = this.$.appContext.components[Name];
    let Attr = {
      _position: this.GetPosition(e),
    };
    this.unSelectAllControls();
    this.Controls.push(<control {...Attr} />);
    this.$nextTick(() => {
      this.SelectControl("C" + (this.Controls.length - 1));
    });
  }
  ClearDragInfo() {
    this.CurrentDragInfo = {
      Name: "",
      Type: "" as any,
    };
    this.CorrectDragPosition = false;
  }
  GetCurrentControlPositionProp() {
    return [
      <div class="ControlPropItem">
        top
        <aInput
          v-model={[
            this.Controls[
              parseInt(this.CurrentControlInfo.refName.replace("C", ""))
            ].props._position.top,
            "value",
          ]}
          onChange={this.$forceUpdate}
        ></aInput>
      </div>,
      <div class="ControlPropItem">
        left
        <aInput
          v-model={[
            this.Controls[
              parseInt(this.CurrentControlInfo.refName.replace("C", ""))
            ].props._position.left,
            "value",
          ]}
          onChange={this.$forceUpdate}
        ></aInput>
      </div>,
    ];
  }

  render() {
    let PropItems: Array<JSX.Element> = [];
    if (this.CurrentControlInfo.Control) {
      let PosProp = this.GetCurrentControlPositionProp();
      PropItems = PosProp.concat(
        Object.keys(this.CurrentControlInfo.Control.ControlProps)
          .sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0))
          .map((p) => (
            <div class="ControlPropItem">
              {p}
              <aInput
                v-model={[
                  this.CurrentControlInfo.Control.ControlProps[p],
                  "value",
                ]}
              />
            </div>
          ))
      );
    }
    return (
      <>
        <div class="ControlList">
          {this.$ControlList.map((m) => (
            <div
              class="ControlItem"
              draggable="true"
              onDragstart={() => {
                this.CurrentDragInfo.Type = "place";
                this.CurrentDragInfo.Name = m;
              }}
            >
              {m}
            </div>
          ))}
        </div>
        <div id="Form">
          {this.Controls.map((control, i) => (
            <control
              ref={"C" + i}
              onClick={() => {
                this.SelectControl("C" + i);
              }}
              onDragstart={(e: DragEvent) => {
                this.CurrentDragInfo.Type = "move";
                this.CurrentDragInfo.Name = "C" + i;
              }}
            />
          ))}
        </div>
        <div class="ControlProps">{PropItems}</div>
      </>
    );
  }
}
