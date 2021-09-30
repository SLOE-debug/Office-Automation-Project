import { App } from "vue";

export default function InstallAllControl(app: App<Element>) {
  app.config.globalProperties.$Controls = [];
  let Controls = require.context("@/Controls", true, /\.tsx$/);
  Controls.keys().forEach((ComponentPath) => {
    let ControlName = ComponentPath.match(
      /(?<=.\/).*(?=Control.tsx)/
    )?.toString();
    if (ControlName) {
      app.config.globalProperties.$Controls.push(ControlName);
      let Commpone = require(`@/Controls/${ControlName}Control`);
      app.component(ControlName, Commpone.default);
    }
  });
}
