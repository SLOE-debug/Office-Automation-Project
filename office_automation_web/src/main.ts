import { createApp } from "vue";
import App from "./App";
import InstallAllControl from "./DesignerBasicsProvider/InstallAllControl";
import InstallAxios from "./plugins/InstallAxios";
import router from "./router";
import vuex from "./vuex";
import "ant-design-vue/dist/antd.css";
import { Select as aSelect } from "ant-design-vue";

var app = createApp(App);
app.component("a-select", aSelect);
// 添加全局自定义$Api属性扩展
app.config.globalProperties.$Api = InstallAxios();
// 注册全部组件
InstallAllControl(app);
app.use(router).use(vuex).mount("#app");
