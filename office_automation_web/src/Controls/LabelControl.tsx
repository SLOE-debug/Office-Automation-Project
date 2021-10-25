import Control, { Include } from "@/DesignerBasicsProvider/Control";

@Include
export default class LabelControl extends Control {
  created() {
    if (!this.transmitProps) {
      this.props.width.v = 80;
      this.props.height.v = 20;
    }
  }
  render() {
    return <div>{this.props.text.v}</div>;
  }
}
