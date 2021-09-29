import BaseControl, { Include } from "./BaseControl";
import { Prop } from "vue-property-decorator";

@Include
export default class LableControl extends BaseControl {
  @Prop({}) msg!: string;
  render() {
    return <div>我是Lable{this.msg}</div>;
  }
}
