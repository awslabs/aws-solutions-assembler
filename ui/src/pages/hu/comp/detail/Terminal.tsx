import React, { useRef, useEffect } from "react";
import Terminal from "react-console-emulator";
import "./HuConfig.scss";

const commands = {
  echo: {
    description: "Echo a passed string.",
    usage: "echo <string>",
    fn: function() {
      return `${Array.from(["a", "bc"]).join(" ")}`;
    }
  }
};

interface TerminalType {
  pushToStdout: any;
  scrollToBottom: any;
  scrollTop: any;
}

interface PropsType {
  message: any;
}

const MyTerminal: React.FC<PropsType> = props => {
  const terminalRef = useRef<TerminalType>();
  // let item = 0;

  useEffect(() => {
    // add a tag if the string contain http url
    let textR = props.message;
    const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
    textR = textR.replace(reg, "<a target='_blank' href='$1$2'>$1$2</a>");
    terminalRef?.current?.pushToStdout(textR);
    terminalRef?.current?.scrollToBottom();
  }, [props.message]);

  return (
    <Terminal
      className="terminal"
      disabled={true}
      dangerMode={true}
      ref={terminalRef}
      autoFocus={true}
      commands={commands}
      promptLabel={" "}
    />
  );
};

export default MyTerminal;
