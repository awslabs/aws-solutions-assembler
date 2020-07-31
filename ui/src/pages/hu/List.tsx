import React from "react";

import { Provider } from "react-redux";
import BreadcrumbsMJ from "features/BreadcrumbsMJ/BreadcrumbsMJ";
import { useTranslation } from "react-i18next";

import HuItem from "./comp/list/HuItem";

import "./List.scss";

import store from "../../store";

const HuList: React.FC = () => {
  window.scrollTo(0, 0);
  const { t } = useTranslation();
  const breadcrumbHome = [{ icon: "home", text: "Home" }];

  return (
    <Provider store={store}>
      <div className="bp3-dark">
        <div className="breadcrumbs">
          <BreadcrumbsMJ breadItems={breadcrumbHome}></BreadcrumbsMJ>
        </div>
        <div className="mahjong-content">
          <div className="page-tile">{t("hu.pageName")}</div>
          <div className="hu-list">
            <HuItem />
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default HuList;
