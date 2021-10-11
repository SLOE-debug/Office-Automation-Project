import { GetDefaleProp } from "@/Util/ControlDefaultProp";
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import "@/assets/css/DesignerBasicsProvider/Control.less";
import DragHelper from "./DragHelper";

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
      let baseDom = baseRender.apply(this);
      // 替换父类中JsxDom的Template标签
      RplaceTemplate(baseDom, render.bind(this));
      // 返回已经被替换的父类JsxDom
      return baseDom;
    };
  })(ctor.__vccOpts.render);
}

export default class Control extends Vue {
  @Prop() attr: any;
  get Style() {
    return {
      width: this.props.width.v + "px",
      height: this.props.height.v + "px",
      top: this.attr.top.v - this.props.height.v / 2 + "px",
      left: this.attr.left.v - this.props.width.v / 2 + "px",
    };
  }
  selected = false;

  props = {
    ...GetDefaleProp(),
  };
  render() {
    return (
      <div style={this.Style} id="Control">
        <DragHelper
          v-show={this.selected}
          {...{
            style: {
              width: this.props.width.v + "px",
              height: this.props.height.v + "px",
            },
            props: this.props,
          }}
        ></DragHelper>
        <template></template>
      </div>
    );
  }
}
