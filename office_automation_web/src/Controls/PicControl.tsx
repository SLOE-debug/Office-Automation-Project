import Control, { Include } from "@/DesignerBasicsProvider/Control";
import { message } from "ant-design-vue";

@Include
export default class PicControl extends Control {
  props = {
    pictureAddress: {
      lable: "本地资源",
      v: {},
      dataValue: undefined,
      des: "控件显示图片的本地资源地址",
    },
    webPictureAddress: {
      lable: "网络资源",
      v: "",
      des: "控件显示图片的网络资源地址（该优先级大于本地资源）",
      onChange: (e: InputEvent) => {
        let value = (e.target as HTMLInputElement).value;
        if (!value.match(/\.png|\.jpeg|\.jpg|\.gif/gi))
          message.error({
            content: "请您输入正确的图片地址（你在这糊弄鬼呢？）",
            duration: 3,
          });
      },
    },
  };
  created() {
    this.props.pictureAddress.v = this.$PhysicalResources;
  }
  render() {
    return (
      <img
        draggable="false"
        src={
          this.props.webPictureAddress.v
            ? this.props.webPictureAddress.v
            : this.props.pictureAddress.dataValue
        }
        style="width:100%;height:100%"
      />
    );
  }
}
