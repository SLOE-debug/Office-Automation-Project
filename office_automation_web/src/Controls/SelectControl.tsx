import Control, { Include } from "@/DesignerBasicsProvider/Control";
import { EventItemType, PropItemType } from "@/Util/ControlCommonType";
import { Options } from "vue-class-component";
import { Select as aSelect } from "ant-design-vue";

@Include
@Options({
  components: { aSelect },
})
export default class SelectControl extends Control {
  props: { [x: string]: PropItemType } = {
    style: {
      lable: "按钮样式",
      v: {
        primary: "primary",
        dashed: "dashed",
        text: "text",
        link: "link",
      },
      dataValue: undefined,
      des: "按钮样式",
    },
    value: {
      lable: "选中值",
      v: "",
      des: "控件当前选中的值",
    },
    items: {
      lable: "选项列表",
      v: "",
      des: "该控件的选项列表（以回车分割）",
      isTextarea: true,
    },
  };
  events: { [x: string]: EventItemType } = {};
  created() {
    delete this.props["backgroundColor"];
    delete this.props["color"];
    if (!this.transmitProps) {
      this.props.width.v = 80;
      this.props.height.v = 30;
    }
  }
  render() {
    return (
      <aSelect
        v-model={[this.props.value.v, "value"]}
        style={"width:100%;"}
        disabled={this.props.disabled.v}
        options={this.props.items.v
          .toString()
          .split("\n")
          .map((m) => {
            return { label: m, value: m };
          })}
        size="small"
        allowClear
        show-search
      ></aSelect>
    );
  }
}
