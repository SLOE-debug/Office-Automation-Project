import BaseControl, { Include } from "./BaseControl";
import { Prop } from "vue-property-decorator";

@Include
export default class PicControl extends BaseControl {
  @Prop({}) msg!: string;
  render() {
    return <div>我是Pic{this.msg}</div>;
  }
}
