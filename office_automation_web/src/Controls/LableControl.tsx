import Control, { Include } from "./Control";
import { Prop } from "vue-property-decorator";

@Include
export default class LableControl extends Control {
  @Prop({}) msg!: string;
  render() {
    return <div>我是Lable{this.msg}</div>;
  }
}
