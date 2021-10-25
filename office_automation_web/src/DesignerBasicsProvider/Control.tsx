import { GetDefaleProp, GetSuffix } from "@/Util/ControlCommonLib";
import { Vue } from "vue-class-component";
import { Prop, Watch } from "vue-property-decorator";
import "@/assets/css/DesignerBasicsProvider/Control.less";
import DragHelper from "./DragHelper";
import { DragHelperMoveType, PropItemType } from "@/Util/ControlCommonType";

/**
 * 递归寻找 Template 组件，如果找到了那么就使用子类Render生成的Jsx.Element替换掉Template
 * @param JsxDom Jsx.Element实例
 * @param render 子类的渲染函数
 */
function RplaceTemplate(JsxDom: any, render: Function) {
  for (let i = 0; i < JsxDom.children.length; i++) {
    if (JsxDom.children[i].children) {
      RplaceTemplate(JsxDom.children[i], render);
    } else {
      if (JsxDom.children[i].type == "template") {
        JsxDom.children[i] = render();
      }
    }
  }
}
/**
 * 基类装饰器，使用该方法会将当前类的Render嵌套在父类的Render的Template中
 * @param ctor 当前类信息
 */
export function Include(ctor: any) {
  let baseRender = ctor.__vccOpts.extends.render;
  // AOP替换当前类的Render方法
  ctor.__vccOpts.render = (function(render) {
    return function(this: Vue) {
      // 获取父类的JsxDom
      let DragHelperDom = baseRender.apply(this);
      let BaseDom = DragHelperDom.children.default();
      // 替换父类中JsxDom的Template标签
      RplaceTemplate(BaseDom, render.bind(this));

      DragHelperDom.children.default = () => BaseDom;
      // 返回已经被替换的父类JsxDom
      return DragHelperDom;
    };
  })(ctor.__vccOpts.render);
}

export default class Control extends Vue {
  @Prop() attr!: { [x: string]: PropItemType };
  @Prop() controlType!: string;
  @Prop({ default: null }) transmitProps!: { [x: string]: PropItemType };
  @Prop() Id!: string;
  get Style() {
    let styleObj = {} as any;
    for (const k in this.props) {
      if (this.props[k].isStyle) {
        let tempValue;
        if (typeof this.props[k].v != "object") tempValue = this.props[k].v;
        else tempValue = this.props[k].dataValue;
        styleObj[k] = tempValue + GetSuffix(k);
      }
    }
    return styleObj;
  }

  get Type() {
    return this.controlType;
  }

  get DragHelperStyle() {
    return {
      width: this.props.width.v + "px",
      height: this.props.height.v + "px",
      top: this.attr.top.v + "px",
      left: this.attr.left.v + "px",
    };
  }
  selected = null;
  @Watch("selected")
  selectedWatch(n: boolean, o: boolean) {
    if (typeof o == "boolean") {
      if (n) {
        this.$refs["DragHelper"].moveType = DragHelperMoveType.Move;
      } else {
        this.$refs["DragHelper"].moveType = DragHelperMoveType.None;
      }
    }
  }

  created() {
    this.props = {
      ...this.attr,
      ...GetDefaleProp(),
      ...this.props,
      ...this.transmitProps,
    };
  }

  props: { [x: string]: PropItemType } = {};
  render() {
    return (
      <DragHelper
        {...{
          style: this.DragHelperStyle,
          tl: this.selected,
          tr: this.selected,
          bl: this.selected,
          br: this.selected,
          t: this.selected,
          b: this.selected,
          l: this.selected,
          r: this.selected,
          ref: "DragHelper",
          props: this.props,
        }}
      >
        {{
          default: () => (
            <div style={this.Style} id="Control">
              <template></template>
            </div>
          ),
        }}
      </DragHelper>
    );
  }
}
