import React, { useContext } from "react";
// import { Tag } from "@blueprintjs/core";
import TextareaAutosize from "react-textarea-autosize";
import Avatar from "react-avatar";

import { Context } from "../../Detail";
import { HuInfoType, HuDetailType } from "../../../../interface";

import "./HuInfo.scss";

const HuInfo: React.FC<HuDetailType> = (props: any) => {
  const huInfo = useContext<HuInfoType>(Context);
  const { huWithTile } = props;
  const huShowName = huInfo.id.split("-").join(" ");
  const huShowDesc = huWithTile.description;

  return (
    <div>
      {huWithTile.name && (
        <div className="basic-info">
          <div className="icon">
            {/* <img className="image" src={cloudIcon} /> */}
            <Avatar
              round={true}
              size="120"
              color="#e76d0c"
              name={huWithTile.name.split("-").join(" ")}
            />
          </div>
          <div className="name">{huShowName}</div>
          <div className="version">
            Version: <b>{huWithTile.version}</b>
          </div>
          <div className="desc">
            <TextareaAutosize value={huShowDesc} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HuInfo;
