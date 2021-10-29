(globalThis as any).importScripts(
  "https://unpkg.com/@typescript/vfs@1.3.0/dist/vfs.globals.js"
);
const tsvfs = (globalThis as any).tsvfs;

const worker = (TypeScriptWorker: any, ts: any, libFileMap: any) => {
  console.log(1);
  return class CustomTs2JsWorker extends TypeScriptWorker {
    async fucking(fileName: any) {
      console.log(1);
    }
  };
};

(self as any).customTSWorkerFactory = worker;
