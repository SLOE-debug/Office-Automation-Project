import Control, { Include } from "./Control";
import { Button } from "ant-design-vue";

@Include
export default class ButtonControl extends Control {
  ControlProps = {
    width: "100px",
    height: "40px",
    text: "按钮",
  };
  render() {
    return (
      <Button type="primary" style="width:100%;height:100%;">
        {this.ControlProps.text}
      </Button>
    );
  }
}
