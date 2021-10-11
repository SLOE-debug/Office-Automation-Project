import { Options, Vue } from "vue-class-component";
import DragHelper from "./DragHelper";
import "@/assets/css/DesignerBasicsProvider/FormContainer.less";
import { Prop } from "vue-property-decorator";
import { GetSuffix } from "@/Util/ControlCommonLib";
import { ControlItemType, PropItemType } from "@/Util/ControlCommonType";

@Options({
  emits: ["SelectControl"],
})
export default class FormContainer extends Vue {
  @Prop() Controls!: Array<ControlItemType>;
  props: { [x: string]: PropItemType } = {
    width: {
      lable: "宽度",
      v: 800,
      des: "控件的宽度",
      styleProp: true,
    },
    height: {
      lable: "高度",
      v: 500,
      des: "控件的高度",
      styleProp: true,
    },
    minWidth: {
      lable: "最小宽度",
      v: 50,
      des: "控件的最小宽度",
    },
    minHeight: {
      lable: "最小高度",
      v: 50,
      des: "控件的最小高度",
    },
  };
  get Style() {
    let styleObj = {} as any;
    for (const k in this.props) {
      if (this.props[k].styleProp) styleObj[k] = this.props[k].v + GetSuffix(k);
    }
    return styleObj;
  }

  selected = false;

  SelectControl(c: ControlItemType | null, i: number, e: MouseEvent) {
    this.$emit(
      "SelectControl",
      i == -1 ? this : this.$refs[c!.controlType + i]
    );
    e.stopPropagation();
  }

  render() {
    return (
      <div
        style={this.Style}
        id="FormContainer"
        onDblclick={(e: MouseEvent) => {
          this.SelectControl(null, -1, e);
        }}
      >
        <DragHelper
          v-show={this.selected}
          {...{
            style: this.Style,
            tl: false,
            tr: false,
            bl: false,
            props: this.props,
          }}
        ></DragHelper>
        {this.Controls.map((c, i) => {
          let control = this.$.appContext.components[c.controlType];
          return (
            <control
              attr={c.attr}
              style={"z-index:" + (i + 1)}
              ref={c.controlType + i}
              onClick={(e: MouseEvent) => {
                this.SelectControl(c, i, e);
              }}
              onMousedown={(e: MouseEvent) => {
                this.SelectControl(c, i, e);
              }}
            ></control>
          );
        })}
      </div>
    );
  }
}
