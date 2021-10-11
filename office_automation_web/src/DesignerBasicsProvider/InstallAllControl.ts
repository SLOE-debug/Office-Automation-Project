import { App } from "vue";

export default function InstallAllControl(app: App<Element>) {
  app.config.globalProperties.$ControlList = [];
  let ControlList = require.context("@/Controls", true, /\.tsx$/);
  ControlList.keys().forEach((ComponentPath) => {
    let ControlName = ComponentPath.match(
      /(?<=.\/).*(?=Control.tsx)/
    )?.toString();
    if (ControlName) {
      app.config.globalProperties.$ControlList.push(ControlName);
      let Commpone = require(`@/Controls/${ControlName}Control`);
      app.component(ControlName, Commpone.default);
    }
  });
}
