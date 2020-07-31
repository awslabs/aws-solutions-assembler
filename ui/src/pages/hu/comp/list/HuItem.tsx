import React, { useEffect, useState } from "react";
import { Button, Tag } from "@blueprintjs/core";
import { useTranslation } from "react-i18next";
import Avatar from "react-avatar";
import TextareaAutosize from "react-textarea-autosize";
import MahjongLoading from "../../../common/Loading";
// import axios from "axios";
import { useHistory } from "react-router-dom";

import MahjongService from "../../service/MahjongService";

// import cloudIcon from "../cloud.svg";

import "./HuItem.scss";

interface HuType {
  id: string;
  name: string;
  version: string;
  desc: string;
}

const HuItem: React.FC = () => {
  const { t } = useTranslation();
  const [huList, setHuList] = useState<Array<HuType>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllHuList = () => {
    MahjongService.getAllHuList()
      .then((response: any) => {
        setIsLoading(false);
        const tmpHuList: Array<HuType> = [];
        if (response) {
          response.data.forEach((element: any) => {
            tmpHuList.push({
              id: element.name,
              name: element.name.split("-").join(" "),
              version: element.version,
              desc: element.description
            });
          });
        }
        // probably add better handling here in the case that there is no result in the find, otherwise you mightrun into the same issue if admin is undefined again
        setHuList(tmpHuList);
      })
      .catch(e => {
        setIsLoading(false);
        console.error(e);
      });
  };

  useEffect(() => {
    getAllHuList();
  }, []);

  const history = useHistory();
  const handleClick = (item: any) => {
    const toPath = "/hu-detail/" + item.id + "/" + item.version;
    history.push({
      pathname: toPath
    });
  };

  if (isLoading) {
    return <MahjongLoading />;
  }

  return (
    <div>
      {huList.map((item: any, index) => {
        return (
          <div key={index}>
            <div className="card">
              <div className="title">{item.name}</div>
              <div className="icon">
                {/* <img width="150" src={cloudIcon} /> */}
                <Avatar
                  round={true}
                  size="120"
                  color="#e76d0c"
                  name={item.name}
                />
              </div>
              <div className="features">
                <div className="version">
                  <Tag>{item.version}</Tag>
                </div>
                <div className="desc">
                  <TextareaAutosize value={item.desc} />
                </div>
                <div className="btn">
                  <Button
                    onClick={() => {
                      handleClick(item);
                    }}
                    style={{ width: "100%" }}
                    rightIcon="arrow-right"
                    intent="warning"
                    text={t("hu.btn.detail")}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HuItem;
