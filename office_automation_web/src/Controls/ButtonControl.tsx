import Control, { Include } from "@/DesignerBasicsProvider/Control";
import { EventItemType, PropItemType } from "@/Util/ControlCommonType";
import { Button } from "ant-design-vue";

@Include
export default class ButtonControl extends Control {
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
    loading: {
      lable: "加载状态",
      v: false,
      des: "按钮是否在加载中",
    },
    ghost: {
      lable: "幽灵属性",
      v: false,
      des: "按钮背景透明",
    },
    danger: {
      lable: "危险按钮",
      v: false,
      des: "按钮的样式是否是危险的",
    },
  };
  events: { [x: string]: EventItemType } = {
    onClick: {
      lable: "单击事件",
      des: "当控件被按下时触发的事件",
      v: undefined,
    },
    onDblclick: {
      lable: "双击事件",
      des: "当控件被双击时触发的事件",
      v: undefined,
    },
  };
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
      <Button
        style={`width:100%;height:100%;font-size: inherit;text-align: inherit;border-radius:${this.props.borderRadius.v}px`}
        loading={this.props.loading.v as boolean}
        type={this.props.style.dataValue as any}
        ghost={this.props.ghost.v as boolean}
        danger={this.props.danger.v as boolean}
        disabled={this.props.disabled.v as boolean}
      >
        {this.props.text.v}
      </Button>
    );
  }
}
