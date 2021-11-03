import { CustomTs2JsWorker } from "@/CustomTs2Js/CustomTs2JsWorker";
import { message } from "ant-design-vue";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

export class CodeEditor {
  private dom: HTMLElement;
  public Instance: monaco.editor.IStandaloneCodeEditor | undefined;
  constructor(_dom: HTMLElement, codeText: string) {
    this.dom = _dom;
    this._createEditor(codeText);
  }
  private _createEditor(codeText: string) {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(`
    type Control = {
      [x: string]: PropItem;
    };
    type PropItem = {
      v: number | string | object | boolean;
      dataValue?: string;
    };
    interface Form {
      controls: { [x: string]: Control };
    }
    `);
    this.Instance = monaco.editor.create(this.dom, {
      value: codeText,
      language: "typescript",
      theme: "vs-dark",
    });
  }
  public async GetJavaScript() {
    const model = this.Instance!.getModel();
    const worker = await monaco.languages.typescript.getTypeScriptWorker();
    const tsWorker = (await worker(model!.uri)) as CustomTs2JsWorker;
    // await tsWorker.outputLanguageService();

    let SemanticErrors = await tsWorker.getSemanticDiagnostics(
      model!.uri.toString()
    );
    let SuggestionErrors = await tsWorker.getSuggestionDiagnostics(
      model!.uri.toString()
    );
    let SyntacticErrors = await tsWorker.getSyntacticDiagnostics(
      model!.uri.toString()
    );
    if (
      SemanticErrors.length == 0 &&
      SuggestionErrors.length == 0 &&
      SyntacticErrors.length == 0
    ) {
      message.success({
        content: "请打开控制台查看输出",
        duration: 3,
      });
      let output = await tsWorker.getEmitOutput(model!.uri.toString());
      let indexText = output.outputFiles[0].text;
      let Form: any;
      eval("Form = " + indexText);
      console.log(new Form());
    } else {
      message.error({
        content: "您的代码存在错误，请检查您的代码",
        duration: 3,
      });
    }
  }
}
