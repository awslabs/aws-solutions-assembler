import React, { useEffect, useState } from "react";
import BreadcrumbsMJ from "features/BreadcrumbsMJ/BreadcrumbsMJ";
import { useTranslation } from "react-i18next";
import MahjongService from "../hu/service/MahjongService";
import classNames from "classnames";
import { Button } from "@blueprintjs/core";

import MahjongLoading from "../common/Loading";
import TileInfo from "./comp/tileDetail/TileInfo";
import DependencyList from "./comp/tileDetail/DependencyList";
import TileConfig from "./comp/tileDetail/TileConfig";
import { TileInfoType } from "../../interface";

import "./Detail.scss";

export const Context = React.createContext<TileInfoType>({
  id: "",
  version: "",
  huId: "",
  huVersion: ""
});

const TileDetail: React.FC = (props: any) => {
  window.scrollTo(0, 0);
  const curTileInfo: TileInfoType = {
    id: props.match.params.tileId,
    version: props.match.params.tileVersion,
    huId: props.match.params.id,
    huVersion: props.match.params.version
  };
  const breadcrumbHome = [
    { icon: "home", text: "Home", href: "/" },
    {
      text: curTileInfo.huId.split("-").join(" "),
      href: `/#/hu-detail/${curTileInfo.huId}/${curTileInfo.huVersion}`
    },
    { text: curTileInfo.id.split("-").join(" ") }
  ];

  const { t } = useTranslation();
  const [tileAndDependencies, setTileAndDependencies] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMax, setIsMax] = useState(false);

  const getTileDetailByNameAndVersion = () => {
    MahjongService.getTileDetailByNameAndVersion(
      curTileInfo.id,
      curTileInfo.version
    )
      .then((response: any) => {
        setIsLoading(false);
        setTileAndDependencies(response.data[0]);
      })
      .catch(e => {
        setIsLoading(false);
        console.error(e);
      });
  };

  useEffect(() => {
    getTileDetailByNameAndVersion();
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
    <Context.Provider value={curTileInfo}>
      <div className="bp3-dark">
        <div className="breadcrumbs">
          <BreadcrumbsMJ breadItems={breadcrumbHome}></BreadcrumbsMJ>
        </div>
        <div className="mahjong-content">
          <div>
            <div className={huInfoClass}>
              <div>
                <TileInfo tileAndDependencies={tileAndDependencies} />
              </div>
            </div>
            <div className={tileClass}>
              <div className="title clearfix">
                <div className="name">
                  <span>{t("tile.listDependency")}</span>
                </div>
              </div>
              <div className="clearfix">
                <DependencyList tileAndDependencies={tileAndDependencies} />
              </div>
            </div>
            <div className={configClass}>
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
              <div className="title">
                <div className="name">
                  <span>Tile YAML</span>
                </div>
              </div>
              <div>
                <TileConfig isMax={isMax} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
};

export default TileDetail;
