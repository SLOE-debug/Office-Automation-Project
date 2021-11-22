import { CustomTs2JsWorker } from "@/CustomTs2Js/CustomTs2JsWorker";
import { message } from "ant-design-vue";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

export class CodeEditor {
  private dom: HTMLElement;
  private codeText: string;
  private vueInstace: any;
  public Instance: monaco.editor.IStandaloneCodeEditor | undefined;

  constructor(_dom: HTMLElement, _codeText: string, _vueInstace: any) {
    this.dom = _dom;
    this.codeText = _codeText;
    this.vueInstace = _vueInstace;
  }
  private _Init() {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES5,
      allowNonTsExtensions: true,
    });
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      [
        "type Control={",
        "\t[x:string]:PropItem;",
        "};",
        "type PropItem={",
        "\tv:number|string|object|boolean;",
        "\tdataValue?:string;",
        "};",
        "interface Form{",
        "\tcontrols:{[x:string]:Control};",
        "};",
      ].join("\n")
    );
  }

  private _CreateEditor(codeText: string) {
    this._Init();
    this.Instance = monaco.editor.create(this.dom, {
      value: codeText,
      language: "typescript",
      theme: "vs-dark",
      automaticLayout: true,
    });
  }

  private FindMatches(search: string, isRegEx: boolean) {
    return this.Instance?.getModel()?.findMatches(
      search,
      true,
      isRegEx,
      false,
      null,
      true
    )!;
  }

  public addLine(eventCode: string) {
    let pageFormStart = this.FindMatches("class.*Form", true);
    let end = this.FindMatches("\\{|\\}", true);
    let mark = 0;
    let range;
    for (let i = 0; i < end!.length; i++) {
      if (
        end![i].range.startLineNumber > pageFormStart[0].range.startLineNumber
      ) {
        if (end![i].matches![0] == "}" && mark % 2 == 0) {
          range = end![i].range;
          break;
        }
        mark += end![i].matches![0] == "}" ? -1 : 1;
      }
    }
    if (range) {
      var text = eventCode + "\n}";
      var op = {
        range: range,
        text: text,
        forceMoveMarkers: true,
      };
      this.Instance!.executeEdits("addLine", [op]);
    }
    return !!range;
  }
  public async GetAllEvents() {
    let Lines = this.Instance ? this.Instance.getValue() : this.codeText;
    let funcNames: Array<string | undefined> = [];
    let funcNameMatch = Lines.match(/(?<=[a-z]\s+).*(?=\(sender.*Event)/gi);
    if (funcNameMatch) {
      funcNames = funcNameMatch.map((m) => m.toString());
    }
    return funcNames;
  }

  public async GetJavaScript() {
    const model = this.Instance!.getModel();
    const worker = await monaco.languages.typescript.getTypeScriptWorker();
    const tsWorker = (await worker(model!.uri)) as CustomTs2JsWorker;
    // await tsWorker.outputLanguageService();

    let SemanticErrors = await tsWorker.getSemanticDiagnostics(
      model!.uri.toString()
    );
    let SyntacticErrors = await tsWorker.getSyntacticDiagnostics(
      model!.uri.toString()
    );
    if (SemanticErrors.length == 0 && SyntacticErrors.length == 0) {
      message.success({
        content: "请打开控制台查看输出",
        duration: 3,
      });
      let output = await tsWorker.getEmitOutput(model!.uri.toString());
      let indexText = output.outputFiles[0].text;
      eval.call(window, indexText);
      // @ts-ignore
      console.log(new PageForm());
    } else {
      message.error({
        content: "您的代码存在错误，请检查您的代码",
        duration: 3,
      });
    }
  }

  public Builder() {
    this._CreateEditor(this.codeText);
    this.Instance!.addAction({
      id: "ToDesigner",
      label: "查看设计器",
      contextMenuGroupId: "navigation",
      contextMenuOrder: 0,
      run: (ed) => {
        this.vueInstace.showCodeEditingArea = false;
      },
    });
  }
}
