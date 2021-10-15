import Control, { Include } from "@/DesignerBasicsProvider/Control";
import { PropItemType } from "@/Util/ControlCommonType";

@Include
export default class LabelControl extends Control {
  props: { [x: string]: PropItemType } = {};
  created() {
    this.props.width.v = 80;
    this.props.height.v = 20;
  }
  render() {
    return <div>{this.props.text.v}</div>;
  }
}
