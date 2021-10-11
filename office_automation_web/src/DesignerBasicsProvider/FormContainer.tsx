import { Options, Vue } from "vue-class-component";
import DragHelper from "./DragHelper";
import "@/assets/css/DesignerBasicsProvider/FormContainer.less";
import { Prop } from "vue-property-decorator";

@Options({
  emits: ["SelectControl"],
})
export default class FormContainer extends Vue {
  @Prop() Controls!: Array<any>;
  props = {
    width: {
      lable: "宽度",
      v: 800,
      des: "该控件的宽度",
    },
    height: {
      lable: "高度",
      v: 500,
      des: "该控件的高度",
    },
    minWidth: {
      lable: "最小宽度",
      v: 50,
      des: "该控件的最小宽度",
    },
    minHeight: {
      lable: "最小高度",
      v: 50,
      des: "该控件的最小高度",
    },
  };
  get Style() {
    return {
      width: this.props.width.v + "px",
      height: this.props.height.v + "px",
    };
  }

  selected = false;

  render() {
    return (
      <div
        style={this.Style}
        ref="formContainer"
        id="FormContainer"
        onDblclick={(e: MouseEvent) => {
          this.$emit("SelectControl", this);
          e.stopPropagation();
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
        {this.Controls.map((c, i) => (
          <c.control
            attr={c.attr}
            style={"z-index:" + (i + 1)}
            ref={c.controlType + i}
            onClick={(e: MouseEvent) => {
              this.$emit("SelectControl", this.$refs[c.controlType + i]);
              e.stopPropagation();
            }}
          ></c.control>
        ))}
      </div>
    );
  }
}
