import React, { useState, useEffect, useContext } from "react";
// import { Button } from "@blueprintjs/core";
// import TextareaAutosize from "react-textarea-autosize";
import MahjongService from "../../service/MahjongService";
import * as monaco from "monaco-editor";
import { Context } from "../../TileDetail";
import { TileInfoType } from "../../../../interface";

import MahjongLoading from "../../../common/Loading";

import "./HuConfig.scss";

interface TileConfigType {
  isMax: boolean;
}

const TileConfig: React.FC<TileConfigType> = props => {
  const [isLoading, setIsLoading] = useState(true);
  const [tileYaml, setTileYaml] = useState("");
  const [editor, setEditor] = useState<any>();
  const { isMax } = props;

  // Get Hu Info From Context
  const tileInfo = useContext<TileInfoType>(Context);

  // Init Yaml Editor Function
  const initYamlEditor = (code: any) => {
    const initCode = code;
    if (editor) {
      editor.setValue(tileYaml);
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
          readOnly: true,
          theme: "vs-dark",
          value: initCode,
          language: "yaml"
        });
        setEditor(monacoEditor);
      }
    }
    setTileYaml(initCode);
  };

  // Get Hu Yaml Info
  const getTileYamlInfo = () => {
    MahjongService.getTileYamlInfo(tileInfo.id, tileInfo.version)
      .then((response: any) => {
        setIsLoading(false);
        initYamlEditor(response.data);
      })
      .catch(e => {
        setIsLoading(false);
        console.error(e);
      });
  };

  useEffect(() => {
    getTileYamlInfo();
  }, []);

  const resizeEditor = () => {
    // If With Editor, Resize Editor
    if (editor !== null && editor !== undefined) {
      editor.layout();
    }
  };

  // Listening Tabinfo Change And Resize Editor
  useEffect(() => {
    resizeEditor();
  }, [isMax]);

  // Listening Window Reisze and Resize Editor
  useEffect(() => {
    window.addEventListener("resize", resizeEditor);
  });

  if (isLoading) {
    return <MahjongLoading />;
  }

  return (
    <div>
      <div id="editor" style={{ height: "600px" }}>
        {/* <TextareaAutosize
          readOnly={true}
          style={{ width: "100%" }}
          className="bp3-input"
          defaultValue={tileYaml}
        /> */}
      </div>
    </div>
  );
};

export default TileConfig;
