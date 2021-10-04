import { Options, Vue } from "vue-class-component";
import "@/assets/css/views/Home.less";
import { Component, ref } from "vue";
import { Input as aInput } from "ant-design-vue";

type DragType = "place" | "move";

@Options({
  components: {
    aInput,
  },
})
export default class Home extends Vue {
  CorrectDragPosition = false;
  CurrentDragInfo = {
    Name: "",
    Type: "" as DragType,
  };
  Controls: Array<Component> = [];
  FormRect: DOMRect = null as any;
  ControlDragEvents: { [x: string]: any } = {
    dragstart: this.DragControlStart,
    dragend: this.DragControlEnd,
    dragover: this.DragControlOver,
    dragenter: this.DragControlIntoForm,
    dragleave: this.DragControlLeaveForm,
    drop: this.DragControlComplete,
  };
  CurrentControlInfo: {
    Control: any;
  } = {
    Control: null,
  };
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
      if (Type == "place") {
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
      if (this.CurrentDragInfo.Type == "move") {
        this.$refs[this.CurrentDragInfo.Name].Position = this.GetPosition(e);
      }
      this.CurrentDragInfo = {
        Name: "",
        Type: "" as any,
      };
      this.CorrectDragPosition = false;
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
    for (const EventType in this.ControlDragEvents) {
      document[destroy ? "removeEventListener" : "addEventListener"](
        EventType,
        this.ControlDragEvents[EventType].bind(this)
      );
    }
  }
  SelectControl(refName: string) {
    this.unSelectAllControls();
    this.$refs[refName].Actived = true;
    this.CurrentControlInfo.Control = this.$refs[refName];
  }

  render() {
    let PropItems: Array<JSX.Element> = [];
    if (this.CurrentControlInfo.Control) {
      PropItems = Object.keys(this.CurrentControlInfo.Control.ControlProps)
        .sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0))
        .map((p) => (
          <div class="ControlPropItem">
            {p}
            <aInput
              type="number"
              v-model={[
                this.CurrentControlInfo.Control.ControlProps[p],
                "value",
              ]}
            />
          </div>
        ));
    }
    return (
      <>
        <div class="ControlList">
          {this.$Controls.map((m) => (
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
