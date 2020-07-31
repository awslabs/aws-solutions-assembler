import React from "react";
// import { Tag } from "@blueprintjs/core";
import TextareaAutosize from "react-textarea-autosize";
import Avatar from "react-avatar";

import { TileDetailType } from "../../../../interface";

import "./TileInfo.scss";

const TileInfo: React.FC<TileDetailType> = (props: any) => {
  const { tileAndDependencies } = props;

  const tileShowName =
    tileAndDependencies && tileAndDependencies.name
      ? tileAndDependencies.name.split("-").join(" ")
      : "";
  const tileShowVersion = tileAndDependencies.version;
  const tileShowDesc = tileAndDependencies.description;

  return (
    <div>
      {tileShowName && (
        <div className="basic-info">
          <div className="icon">
            <Avatar
              round={true}
              size="120"
              color="#e76d0c"
              name={tileShowName.split("-").join(" ")}
            />
          </div>
          <div className="name">{tileShowName}</div>
          <div className="version">
            {/* Version: <Tag>{"v1.0.1"}</Tag> */}
            Version: <b>{tileShowVersion}</b>
          </div>
          <div className="desc">
            <TextareaAutosize value={tileShowDesc} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TileInfo;
