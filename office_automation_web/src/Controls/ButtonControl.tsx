import Control, { Include } from "@/DesignerBasicsProvider/Control";
import { Button } from "ant-design-vue";

@Include
export default class ButtonControl extends Control {
  created() {
    this.props.width.v = 80;
    this.props.height.v = 30;
    this.props.backgroundColor.v = "#1890ff";
    this.props.borderWidth.v = 1;
    this.props.borderStyle.dataValue = "solid";
    this.props.borderColor.v = "#1890ff";
    this.props.color.v = "#FFFFFF";
  }
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
