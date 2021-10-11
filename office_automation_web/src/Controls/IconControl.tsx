import Control, { Include } from "@/DesignerBasicsProvider/Control";
import { SyncOutlined } from "@ant-design/icons-vue";

@Include
export default class IconControl extends Control {
  render() {
    return (
      <SyncOutlined spin style="color:#eb2f96;font-size:28px;"></SyncOutlined>
    );
  }
}
