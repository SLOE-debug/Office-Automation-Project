import { createApp } from "vue";
// 请不要尝试将它移除，如果将它移除，您将会获得全局xxxx属性 不属于 xxxx类的错误
import * as VueCore from "@vue/runtime-core";
import App from "./App";
import InstallAllControl from "./plugins/Controls/InstallAllControl";
import InstallAxios from "./plugins/InstallAxios";
import router from "./router";
import 'ant-design-vue/dist/antd.css';

var app = createApp(App);
// 添加全局自定义$Api属性扩展
app.config.globalProperties.$Api = InstallAxios();
// 注册全部组件
InstallAllControl(app);
app.use(router).mount("#app");
