import React, { Suspense } from "react";
import { withTranslation } from "react-i18next";
import { HashRouter, Route } from "react-router-dom";

import NavMahjong from "features/nav/NavMahjong";
import MahjongLoading from "./pages/common/Loading";
import "./App.scss";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";

import HuList from "./pages/hu/List";
import HuDetail from "./pages/hu/Detail";
import TileDetail from "./pages/hu/TileDetail";

const HuListPage = withTranslation()(HuList);
const HuDetailPage = withTranslation()(HuDetail);
const TileDetailPage = withTranslation()(TileDetail);

// loading component for suspense fallback
const Loader = () => (
  <div className="App">
    <div className="app-loading">
      <MahjongLoading />
      AWS Solution is loading...
    </div>
  </div>
);

function RouterAppPage() {
  return (
    <div className="bp3-dark">
      <NavMahjong></NavMahjong>
      <HashRouter>
        <Route path="/" exact component={HuListPage}></Route>
        <Route path="/home" exact component={HuListPage}></Route>
        <Route
          path="/hu-detail/:id/:version"
          exact
          component={HuDetailPage}
        ></Route>
        <Route
          path="/hu-detail/:id/:version/:tileId/:tileVersion"
          exact
          component={TileDetailPage}
        ></Route>
      </HashRouter>
    </div>
  );
}

// here app catches the suspense from page in case translations are not yet loaded
export default function RouterApp() {
  return (
    <Suspense fallback={<Loader />}>
      <RouterAppPage />
    </Suspense>
  );
}
