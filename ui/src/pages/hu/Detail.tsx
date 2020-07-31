import React, { useEffect, useState } from "react";
// import { Provider } from "react-redux";
import BreadcrumbsMJ from "features/BreadcrumbsMJ/BreadcrumbsMJ";
import { useTranslation } from "react-i18next";
// import axios from "axios";
import MahjongService from "../hu/service/MahjongService";
import classNames from "classnames";

import { Button } from "@blueprintjs/core";

import MahjongLoading from "../common/Loading";
import HuInfo from "./comp/detail/HuInfo";
import TileList from "./comp/detail/TileList";
import HuConfig from "./comp/detail/HuConfig";
import { HuInfoType } from "../../interface";

import "./Detail.scss";

// import store from "../../store";

export const Context = React.createContext<HuInfoType>({ id: "", version: "" });

const HuDetail: React.FC = (props: any) => {
  window.scrollTo(0, 0);
  const curHuInfo: HuInfoType = {
    id: props.match.params.id,
    version: props.match.params.version
  };
  const breadcrumbHome = [
    { icon: "home", text: "Home", href: "/#/" },
    { text: curHuInfo.id.split("-").join(" ") }
  ];

  const { t } = useTranslation();
  const [huWithTile, setHuWithTile] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMax, setIsMax] = useState(false);

  const getHuDetailByNameAndVersion = () => {
    MahjongService.getHuDetailByNameAndVersion(curHuInfo.id, curHuInfo.version)
      .then((response: any) => {
        setIsLoading(false);
        setHuWithTile(response.data[0]);
      })
      .catch(e => {
        setIsLoading(false);
        console.error(e);
      });
  };

  useEffect(() => {
    getHuDetailByNameAndVersion();
  }, []);

  const maxSizeForConfig = () => {
    setIsMax(true);
  };
  const minSizeForConfig = () => {
    setIsMax(false);
  };

  if (isLoading) {
    return <MahjongLoading />;
  }

  const huInfoClass = classNames({
    "hu-info": true,
    max: isMax
  });

  const tileClass = classNames({
    "tile-list": true,
    hidden: isMax
  });

  const configClass = classNames({
    "hu-settings": true,
    max: isMax
  });

  return (
    <Context.Provider value={curHuInfo}>
      <div className="bp3-dark">
        <div className="breadcrumbs">
          <BreadcrumbsMJ breadItems={breadcrumbHome}></BreadcrumbsMJ>
        </div>
        <div className="mahjong-content">
          <div>
            <div className={huInfoClass}>
              {/* <div>HuInfo</div> */}
              <div>
                <HuInfo huWithTile={huWithTile} />
              </div>
            </div>
            <div className={tileClass}>
              <div className="title clearfix">
                <div className="name">
                  {/* <FontAwesome name="server" /> */}
                  {/* <Icon icon="new-grid-item" intent={Intent.NONE} /> */}
                  <span>{t("tile.listTitle")}</span>
                </div>
              </div>
              <div className="clearfix">
                <TileList huWithTile={huWithTile} />
              </div>
            </div>
            <div className={configClass}>
              {/* <div className="title">
                <div className="name">
                  <span>Configuration Center</span>
                </div>
              </div> */}
              <div className="window-resize">
                {isMax ? (
                  <Button
                    onClick={minSizeForConfig}
                    className="hide-when-small bp3-minimal"
                    icon="minimize"
                  />
                ) : (
                  <Button
                    onClick={maxSizeForConfig}
                    className="hide-when-small bp3-minimal"
                    icon="maximize"
                  />
                )}
              </div>
              <div>
                <HuConfig isMax={isMax} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
};

export default HuDetail;
