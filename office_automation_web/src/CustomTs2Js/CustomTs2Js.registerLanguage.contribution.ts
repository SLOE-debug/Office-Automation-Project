let registerLanguage =
  require("monaco-editor/esm/vs/basic-languages/_.contribution.js").registerLanguage;
registerLanguage({
  id: "typescript",
  extensions: [".ts", ".tsx"],
  aliases: ["TypeScript", "ts", "typescript"],
  mimetypes: ["text/typescript"],
  loader: function () {
    // @ts-ignore
    return import(
      // @ts-ignore
      "monaco-editor/esm/vs/basic-languages/typescript/typescript.js"
    );
  },
});
