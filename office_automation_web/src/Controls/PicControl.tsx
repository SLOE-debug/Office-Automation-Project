import Control, { Include } from "./Control";
import { Prop } from "vue-property-decorator";

@Include
export default class PicControl extends Control {
  @Prop({}) msg!: string;
  render() {
    return <div>我是Pic{this.msg}</div>;
  }
}
