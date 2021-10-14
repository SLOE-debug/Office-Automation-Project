import Control, { Include } from "@/DesignerBasicsProvider/Control";
import { borderStyleModel, GetDefaleProp } from "@/Util/ControlCommonLib";
import { PropItemType } from "@/Util/ControlCommonType";
import { Button } from "ant-design-vue";

@Include
export default class ButtonControl extends Control {
  props: { [x: string]: PropItemType } = {
    width: {
      lable: "宽度",
      v: 80,
      des: "控件的宽度",
      styleProp: true,
    },
    height: {
      lable: "高度",
      v: 30,
      des: "控件的高度",
      styleProp: true,
    },
    backgroundColor: {
      lable: "背景颜色",
      v: "#1890ff",
      des: "控件背景颜色",
      styleProp: true,
    },
    borderWidth: {
      lable: "边框大小",
      v: 1,
      des: "控件边框的大小",
      styleProp: true,
    },
    borderStyle: {
      lable: "边框样式",
      v: borderStyleModel,
      dataValue: "solid",
      des: "控件边框的样式",
      styleProp: true,
    },
    borderColor: {
      lable: "边框颜色",
      v: "#1890ff",
      des: "控件边框颜色",
      styleProp: true,
    },
    color: {
      lable: "字体颜色",
      v: "white",
      des: "控件字体颜色",
      styleProp: true,
    },
  };
  render() {
    return (
      <Button
        type="primary"
        style="width:100%;height:100%;font-size: inherit;text-align: inherit;background:none;border: none;color:inherit"
      >
        {this.props.text.v}
      </Button>
    );
  }
}
