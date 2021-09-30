import { Vue } from "vue-class-component";
import "@/assets/css/views/Home.less";
import { Component } from "vue";

export default class Home extends Vue {
  CorrectDragPosition = false;
  CurrentControlName = "";
  Controls: Array<Component> = [];
  FormRect: DOMRect = {} as any;
  ControlDragEvents: { [x: string]: any } = {
    dragstart: this.DragControlStart,
    dragend: this.DragControlEnd,
    dragover: this.DragControlOver,
    dragenter: this.DragControlIntoForm,
    dragleave: this.DragControlLeaveForm,
    drop: this.DragControlComplete,
  };
  DragControlStart(e: DragEvent) {
    (e.target as HTMLElement).style.opacity = "0.5";
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
  DragControlComplete(e: DragEvent) {
    e.preventDefault();
    if (this.CorrectDragPosition && this.CurrentControlName) {
      let control = this.$.appContext.components[this.CurrentControlName];
      let Attr = {
        Position: {
          top: e.y - this.FormRect.y + "px",
          left: e.x - this.FormRect.x + "px",
        },
      };
      this.Controls.push(
        <control {...Attr} onUnfocusAllControls={this.UnfocusAllControls} />
      );
      this.CurrentControlName = "";
    }
  }
  UnfocusAllControls() {
    for (const key in this.$refs) {
      if (key[0] == "C") {
        (this.$refs[key] as any).CancelFocus();
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

  render() {
    return (
      <>
        <div class="ControlList">
          {this.$Controls.map((m) => (
            <div
              class="ControlItem"
              draggable="true"
              onDragstart={() => {
                this.CurrentControlName = m;
              }}
            >
              {m}
            </div>
          ))}
        </div>
        <div id="Form">
          {this.Controls.map((control, i) => (
            <control ref={"C" + i} />
          ))}
        </div>
      </>
    );
  }
}
