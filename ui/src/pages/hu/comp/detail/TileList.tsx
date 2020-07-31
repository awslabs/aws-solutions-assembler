import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tag } from "@blueprintjs/core";
// import axios from "axios";
import Avatar from "react-avatar";
// import SortableTree, { getVisibleNodeCount } from "react-sortable-tree";
import "react-sortable-tree/style.css"; // This only needs to be imported once in your app
import { HuDetailType } from "../../../../interface";

import "./TileList.scss";

const TileList: React.FC<HuDetailType> = (props: any) => {
  const { huWithTile } = props;

  const [tileList, setTileList] = useState([]);

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
    if (huWithTile && huWithTile.dependencies) {
      const newTree = huWithTile.dependencies.map((item: any) => mapTree(item));
      setTileList(newTree);
    }
  }, [huWithTile]);

  return (
    <div>
      {tileList.map((item: any, index) => {
        return (
          <div className="tile-item" key={index}>
            <div className="icon">
              {/* <img width="80%" src={cloudIcon} /> */}
              <Avatar
                round={false}
                size="60"
                color="#007eb9"
                name={item.title}
              />
            </div>
            <div className="content">
              <div className="name">
                <Link
                  to={`/hu-detail/${huWithTile.name}/${huWithTile.version}/${item.name}/${item.version}`}
                >
                  {item.title}
                </Link>
              </div>
              <div className="version">
                <Tag>{item.version}</Tag>
              </div>
              <div className="desc">{item.desc ? item.desc : item.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TileList;
