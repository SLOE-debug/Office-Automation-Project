import Control, { Include } from "@/DesignerBasicsProvider/Control";
import { GetDefaleProp } from "@/Util/ControlCommonLib";
import { PropItemType } from "@/Util/ControlCommonType";
import { Button } from "ant-design-vue";

@Include
export default class ButtonControl extends Control {
  props = {
    ...GetDefaleProp(),
    text: {
      lable: "文本",
      v: "按钮",
      des: "控件显示的文本",
    },
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
  };
  render() {
    return (
      <Button type="primary" style="width:100%;height:100%;">
        {this.props.text.v}
      </Button>
    );
  }
}
