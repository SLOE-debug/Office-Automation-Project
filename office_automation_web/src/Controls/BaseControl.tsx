import { Vue } from "vue-class-component";

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

export default class BaseControl extends Vue {
  render() {
    return (
      <>
        <template></template>
      </>
    );
  }
}
