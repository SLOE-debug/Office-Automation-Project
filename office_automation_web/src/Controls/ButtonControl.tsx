import Control, { Include } from "@/DesignerBasicsProvider/Control";
import { GetDefaleProp } from "@/Util/ControlDefaultProp";
import { Button } from "ant-design-vue";

@Include
export default class ButtonControl extends Control {
  props = {
    ...GetDefaleProp(),
    text: {
      lable: "文本",
      v: "按钮",
      des: "该控件显示的文本",
    },
    width: {
      lable: "宽度",
      v: 80,
      des: "该控件的宽度",
    },
    height: {
      lable: "高度",
      v: 30,
      des: "该控件的高度",
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
