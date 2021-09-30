import Control, { Include } from "./Control";
import { SyncOutlined } from "@ant-design/icons-vue";

@Include
export default class IconControl extends Control {
  Style = {
    width: "32px",
    height: "32px",
  };
  render() {
    return <SyncOutlined spin style="color:#eb2f96;font-size:28px;"></SyncOutlined>;
  }
}
