let edworker = require("monaco-editor/esm/vs/editor/editor.worker.js");
import { CustomTs2JsWorker } from "./CustomTs2JsWorker";

self.onmessage = function () {
  // ignore the first message
  edworker.initialize(function (ctx: any, createData: any) {
    return new CustomTs2JsWorker(ctx, createData);
  });
};
