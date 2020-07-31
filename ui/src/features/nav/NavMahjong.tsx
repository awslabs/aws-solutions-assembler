import React, { useState, useEffect } from "react";
// i18n
import { useTranslation } from "react-i18next";
import axios from "axios";

import protoLogo from "./AWS-Prototyping_Logo_White.svg";
import { Button, Navbar, Alignment, Icon, MenuItem } from "@blueprintjs/core";
import styles from "./NavMahjong.module.scss";

import { ItemRenderer, Select } from "@blueprintjs/select";

import {
  EN_TITLE,
  CN_TITLE,
  GITHUB_LINK,
  DOC_EN_LINK,
  DOC_CN_LINK
} from "../../../src/pages/const";

interface LangType {
  name: string;
  id: string;
}

const langList = [
  {
    id: "en",
    name: "English",
    pageTitle: EN_TITLE
  },
  {
    id: "zh-CN",
    name: "简体中文",
    pageTitle: CN_TITLE
  }
];

const getCurrentLangObj = (id: string) => {
  let defaultItem = null;
  langList.map(item => {
    if (id === item.id) {
      defaultItem = item;
    }
  });
  return defaultItem ? defaultItem : langList[0];
};

const LangSelect = Select.ofType<LangType>();

const renderFilm: ItemRenderer<LangType> = (
  item,
  { handleClick, modifiers }
) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }
  return (
    <MenuItem
      active={modifiers.active}
      key={item.id}
      // label={item.name}
      onClick={handleClick}
      text={item.name}
    />
  );
};

const NavMahjong: React.FC = () => {
  const { t, i18n } = useTranslation();

  const initLang = getCurrentLangObj(i18n.language);

  const [currentLang, setCurrentLang] = useState<LangType>(initLang);

  const [mjVersion, setMJVersion] = useState("");
  document.title = initLang.pageTitle;

  const goToGitUrl = () => {
    window.open(GITHUB_LINK, "_blank");
  };

  const changeSelectLang = (item: any) => {
    setCurrentLang(item);
    i18n.changeLanguage(item.id);
  };

  const goToDocsUrl = () => {
    let docUrl = DOC_EN_LINK;
    if (currentLang.id === "zh" || currentLang.id === "zh-CN") {
      docUrl = DOC_CN_LINK;
    }
    window.open(docUrl, "_blank");
  };

  useEffect(() => {
    axios.get("/version").then(response => {
      const tmpArr = response.data.split(/[\n]/);
      const versionArr = tmpArr[0].split(":");
      setMJVersion(versionArr[1].trim());
    });
  }, []);

  return (
    <Navbar>
      <Navbar.Group align={Alignment.LEFT}>
        {/* <img src={logo} alt="logo" className={styles.applogo} /> */}
        <Navbar.Heading>
          <b>{t("title")}</b>
        </Navbar.Heading>
        <Navbar.Divider />
        <span className="bp3-tag .modifier">
          {mjVersion ? mjVersion : "..."}
        </span>
        <Navbar.Divider />
        <LangSelect
          filterable={false}
          itemRenderer={renderFilm}
          items={langList}
          onItemSelect={changeSelectLang}
        >
          <Button text={currentLang ? currentLang.name : "(No selection)"} />
        </LangSelect>
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        <div className="bp3-input-group .modifier">
          <span className="bp3-icon bp3-icon-search"></span>
          <input
            className="bp3-input"
            type="search"
            placeholder={t("docs.search")}
            dir="auto"
          />
        </div>
        <Navbar.Divider className="hide-when-small" />
        <Button
          onClick={goToDocsUrl}
          className="hide-when-small bp3-minimal"
          icon="document"
          text={t("docs.name")}
        />
        <Button
          onClick={goToGitUrl}
          className="hide-when-small bp3-minimal"
          icon="git-repo"
          text="Github"
        />
        <Navbar.Divider className="hide-when-small" />
        <span className={styles.madeBy}>{t("madeWith")} &nbsp;</span>
        <Icon icon="heart"></Icon>
        <span className={styles.madeBy}> &nbsp; by &nbsp;</span>
        <Icon
          icon={<img src={protoLogo} alt="logo" className={styles.protoLogo} />}
        />
      </Navbar.Group>
    </Navbar>
  );
};

export default NavMahjong;
