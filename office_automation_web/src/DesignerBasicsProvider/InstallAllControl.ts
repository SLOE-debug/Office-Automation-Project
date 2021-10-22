import { App } from "vue";

export default function InstallAllControl(app: App<Element>) {
  app.config.globalProperties.$ControlList = [];
  app.config.globalProperties.$PhysicalResources = {};
  let ControlList = require.context("@/Controls", true, /\.tsx$/);
  ControlList.keys().forEach((ComponentPath) => {
    let ControlName = ComponentPath.replace("Control.tsx", "").substr(2);
    if (ControlName) {
      app.config.globalProperties.$ControlList.push(ControlName);
      let Commpone = __webpack_require__(ControlList.resolve(ComponentPath));
      app.component(ControlName, Commpone.default);
    }
  });
  let physicalResources = require.context(
    "@/",
    true,
    /\.png$|\.jpg$|\.jpeg$|\.gif$/
  );
  physicalResources.keys().forEach((path) => {
    let name = "";
    let subPath = path.split("/");
    name = subPath[subPath.length - 1].replace(" ", "_");
    app.config.globalProperties.$PhysicalResources[name] = __webpack_require__(
      physicalResources.resolve(path)
    );
  });
}
