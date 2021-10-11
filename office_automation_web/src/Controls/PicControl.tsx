import Control, { Include } from "@/DesignerBasicsProvider/Control";

@Include
export default class PicControl extends Control {
  render() {
    return (
      <img
        draggable="false"
        src={require("@/assets/image/Views/1165107.jpg")}
        style="width:100%;height:100%"
      />
    );
  }
}
