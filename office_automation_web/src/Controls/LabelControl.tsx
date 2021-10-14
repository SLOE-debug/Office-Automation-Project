import Control, { Include } from "@/DesignerBasicsProvider/Control";
import { PropItemType } from "@/Util/ControlCommonType";

@Include
export default class LabelControl extends Control {
  props: { [x: string]: PropItemType } = {
    width: {
      lable: "宽度",
      v: 80,
      des: "控件的宽度",
      styleProp: true,
    },
    height: {
      lable: "高度",
      v: 20,
      des: "控件的高度",
      styleProp: true,
    },
  };
  render() {
    return <div>{this.props.text.v}</div>;
  }
}
