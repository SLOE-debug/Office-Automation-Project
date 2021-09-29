import { Vue } from "vue-class-component";
import "@/assets/css/Home.less";
import { Component } from "_vue@3.2.19@vue";

export default class Home extends Vue {
  Controls: Array<Component> = [];
  AddControl(ControlName: string) {
    this.Controls.push(this.$.appContext.components[ControlName]);
  }
  render() {
    return (
      <>
        <div class="ControlList">
          {this.$Controls.map((m) => (
            <div class="ControlItem" onClick={() => this.AddControl(m)}>
              {m}
            </div>
          ))}
        </div>
        <div class="displayBlock">
          {this.Controls.map((control) => (
            <control msg="附加信息" />
          ))}
        </div>
      </>
    );
  }
}
