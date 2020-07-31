import React, { useEffect, useState } from "react";
import { Tag } from "@blueprintjs/core";
import Avatar from "react-avatar";
import { TileDetailType } from "../../../../interface";
import { useTranslation } from "react-i18next";

import "./DependencyList.scss";

const DependencyList: React.FC<TileDetailType> = (props: any) => {
  const { tileAndDependencies } = props;
  const [tileList, setTileList] = useState([]);
  const [hasDepend, setHasDepend] = useState(false);
  const { t } = useTranslation();

  const mapTree = (item: any) => {
    const haveChildren =
      Array.isArray(item.dependencies) && item.dependencies.length > 0;
    return {
      //分别将我们查询出来的值做出改变他的key
      name: item.name,
      title: item.name.split("-").join(" "),
      version: item.versionTag,
      desc: item.description,
      // children: item.dependencies
      //判断它是否存在子集，若果存在就进行再次进行遍历操作，知道不存在子集便对其他的元素进行操作
      children: haveChildren
        ? item.dependencies.map((i: any) => mapTree(i))
        : []
    };
  };

  useEffect(() => {
    if (tileAndDependencies && tileAndDependencies.dependencies) {
      const newTree = tileAndDependencies.dependencies.map((item: any) =>
        mapTree(item)
      );
      setTileList(newTree);
      if (newTree && newTree.length > 0) {
        setHasDepend(true);
      } else {
        setHasDepend(false);
      }
    }
  }, [tileAndDependencies]);

  return (
    <div>
      {hasDepend ? (
        <div>
          {tileList.map((item: any, index) => {
            return (
              <div className="tile-item" key={index}>
                <div className="icon">
                  <Avatar
                    round={false}
                    size="60"
                    color="#007eb9"
                    name={item.title}
                  />
                </div>
                <div className="content">
                  <div className="name">{item.title}</div>
                  <div className="version">
                    <Tag>{item.version}</Tag>
                  </div>
                  <div className="desc">
                    {item.desc ? item.desc : item.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-data">{t("tile.nodepend")}</div>
      )}
    </div>
  );
};

export default DependencyList;
