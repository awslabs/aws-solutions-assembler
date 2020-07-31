import React, { useEffect, useState } from "react";
import * as monaco from "monaco-editor";

import { TabInfo } from "../../../../interface";

const tmpCode = "";

const HuConfigYaml: React.FC<TabInfo> = (props: any) => {
  const { tabInfo, initContent, isMax } = props;
  // Define Editor
  const [editor, setEditor] = useState<any>();
  // Define code in editor
  const [code, setCode] = useState(tmpCode);
  // Get Hu Info From Context

  // Init Yaml Editor Function
  const initYamlEditor = (code: any) => {
    const initCode = code;
    if (editor) {
      // Editor in document, Nothing to do now.
      editor.setValue(initContent);
    } else {
      // Init The Editor
      const editorWrap = document.getElementById("editor");
      if (editorWrap) {
        const monacoEditor = monaco.editor.create(editorWrap, {
          // Scroll to button will scroll parent
          scrollbar: {
            alwaysConsumeMouseWheel: false
          },
          selectOnLineNumbers: false,
          theme: "vs-dark",
          value: initCode,
          language: "yaml"
        });
        // Listening Change Event
        monacoEditor.onDidChangeModelContent(() => {
          // Get New Code From Editor
          const newCode = monacoEditor.getValue();
          setCode(newCode);
          props.GETState({ content: newCode });
        });
        setEditor(monacoEditor);
      }
    }
    setCode(initCode);
  };

  useEffect(() => {
    if (initContent != null && initContent != undefined && initContent != "") {
      initYamlEditor(initContent);
    }
  }, [initContent]);

  const resizeEditor = () => {
    // If With Editor, Resize Editor
    if (editor !== null && editor !== undefined) {
      editor.layout();
    }
  };

  // Listening Tabinfo Change And Resize Editor
  useEffect(() => {
    resizeEditor();
  }, [tabInfo, isMax]);

  // Listening Window Reisze and Resize Editor
  useEffect(() => {
    window.addEventListener("resize", resizeEditor);
  });

  // Transit Code to parent component
  useEffect(() => {
    props.GETState({ content: code });
  }, [code]);

  return (
    <div>
      <div id="editor" style={{ height: "500px" }}></div>
    </div>
  );
};

export default HuConfigYaml;
