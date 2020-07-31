import React, { useState, useEffect, useContext } from "react";
import {
  Tab,
  Tabs,
  Classes,
  Button,
  Dialog,
  Tooltip,
  Alert,
  Intent
} from "@blueprintjs/core";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import MahjongService from "../../service/MahjongService";
import { Context } from "../../Detail";
import { HuInfoType } from "../../../../interface";

import HuConfigForm from "./HuConfigForm";
import HuConfigYaml from "./HuConfigYaml";

import Terminal from "./Terminal";
import { SOCKET_PATH } from "../../../const";
import MahjongLoading from "../../../common/Loading";

import "./HuConfig.scss";

interface HuConfigType {
  isMax: boolean;
}

const HuConfig: React.FC<HuConfigType> = (props: any) => {
  const { t } = useTranslation();

  const { isMax } = props;

  const [tab, changeTab] = useState("user");
  const [isOpen, setDialogOpen] = useState(false);
  const [isDry, setIsDry] = useState(true);
  const [openAlert, setOpenAlert] = useState(false);
  const [openRuningAlert, setOpenRuningAlert] = useState(false);
  const [isRuning, setIsRuning] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [changeFromChild, setChangeFromChild] = useState(false);

  // YAML Content
  const [yamlContent, setYAMLContent] = useState(null);
  // JSON Content
  const [jsonContent, setJsonContent] = useState(null);
  // Get Hu Info From Context
  const huInfo = useContext<HuInfoType>(Context);

  const tranYamlToJson = (yamlData: any) => {
    MahjongService.yamlToJson(yamlData).then(jsonRes => {
      setIsLoading(false);
      setJsonContent(jsonRes.data);
    });
  };

  const tranJsonToYaml = (jsonData: any) => {
    MahjongService.jsonToYaml(jsonData).then(yamlRes => {
      setIsLoading(false);
      setYAMLContent(yamlRes.data);
    });
  };

  // Get Hu Yaml Info
  const getHuYamlInfo = () => {
    MahjongService.getHuYamlInfo(huInfo.id, huInfo.version)
      .then((response: any) => {
        setYAMLContent(response.data);
        tranYamlToJson(response.data);
      })
      .catch(e => {
        console.error(e);
      });
  };

  useEffect(() => {
    if (!changeFromChild) {
      getHuYamlInfo();
    }
  }, [changeFromChild, getHuYamlInfo]);

  // Websocket Area Start
  const [resMsg, setResMsg] = useState("");
  let ws: any = null;
  // WebSocket Area End

  const handleTabChange = (item: any) => {
    changeTab(item);
  };

  const history = useHistory();
  const goToListPage = () => {
    const toPath = "/home";
    history.push({
      pathname: toPath
    });
  };

  const connectWSWithRun = (isDry: boolean, callback: Function) => {
    ws = new WebSocket(
      `${SOCKET_PATH}/v1alpha1/ws?dryRun=${isDry ? true : undefined}`
    );
    ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      if (callback) {
        callback();
      }
    };

    ws.onmessage = (evt: any) => {
      // on receiving a message, add it to the list of messages
      // If the message contains d-done, Close the WS
      if (evt.data.indexOf("d-done") >= 0) {
        setIsRuning(false);
        ws.close();
      }
      setResMsg(evt.data);
    };

    ws.onclose = () => {
      // automatically try to reconnect on connection loss
    };
  };

  const startRun = () => {
    if (isRuning && isDry === true) {
      setOpenRuningAlert(true);
      return;
    }
    if (isRuning === false) {
      setOpenAlert(true);
      setDialogOpen(false);
    } else {
      setOpenAlert(false);
      setDialogOpen(true);
    }
    // setDialogOpen(false);
    // setIsDry(false);
    // setOpenAlert(true);
  };

  const startDryRun = () => {
    if (isRuning && isDry === false) {
      setOpenRuningAlert(true);
      return;
    }
    connectWSWithRun(true, () => {
      setIsDry(true);
      setDialogOpen(true);
      // if Not In Runing, Not to send message to WS
      if (isRuning === false) {
        if (isRuning === false) {
          ws.send(yamlContent);
        }
        setIsRuning(true);
      }
    });
    // sendMessage(yamlContent);
  };

  const closeRunDialog = () => {
    setDialogOpen(false);
  };

  const handleRunCancel = () => {
    setOpenAlert(false);
  };

  const handleRunConfirm = () => {
    connectWSWithRun(false, () => {
      setIsDry(false);
      // if Not In Runing, Not to send message to WS
      setOpenAlert(false);
      if (isRuning === false) {
        setDialogOpen(true);
        if (isRuning === false) {
          ws.send(yamlContent);
        }
        setIsRuning(true);
      }
    });
  };

  const getYamlContent = (val: any) => {
    setChangeFromChild(true);
    tranYamlToJson(val.content);
    setYAMLContent(val.content);
  };

  const getJsonContent = (val: any) => {
    setChangeFromChild(true);
    tranJsonToYaml(val.content);
  };

  const handleCancelRuning = () => {
    setOpenRuningAlert(false);
  };

  const handleConfirmRuning = () => {
    setOpenRuningAlert(false);
    if (isRuning && isDry) {
      startDryRun();
    } else {
      setOpenAlert(false);
      setDialogOpen(true);
      handleRunConfirm();
    }
  };

  if (isLoading) {
    return <MahjongLoading />;
  }

  return (
    <div>
      <Tabs id="HuConfigTab" onChange={handleTabChange} selectedTabId={tab}>
        <Tab
          id="user"
          title={t("tile.tab.user")}
          panel={
            <HuConfigForm
              GETState={getJsonContent}
              tabInfo={tab}
              jsonContent={jsonContent}
            />
          }
          panelClassName="user-panel"
        />
        <Tab
          id="dev"
          title={t("tile.tab.dev")}
          panel={
            <HuConfigYaml
              GETState={getYamlContent}
              tabInfo={tab}
              isMax={isMax}
              initContent={yamlContent}
            />
          }
          panelClassName="dev-panel"
        />
      </Tabs>
      <div>
        <div className="hu-run-buttons">
          <Button icon="arrow-left" onClick={goToListPage}>
            {t("tile.btn.back")}
          </Button>
          <Button icon="refresh" onClick={startDryRun}>
            {t("tile.btn.dryRun")}
          </Button>
          <Button icon="refresh" intent="success" onClick={startRun}>
            {t("tile.btn.run")}
          </Button>
        </div>
      </div>
      <div className="hu-run-dialog">
        <Dialog
          isCloseButtonShown={false}
          onClose={closeRunDialog}
          canEscapeKeyClose={false}
          canOutsideClickClose={false}
          className="run-dialog"
          isOpen={isOpen}
          icon="info-sign"
          title="Hu Run Terminal"
        >
          <div className={Classes.DIALOG_BODY}>
            <p>
              {isDry ? (
                <strong>This is Dry Run Terminal.</strong>
              ) : (
                <strong>This is Run Terminal.</strong>
              )}
            </p>
            {/* <p className="desc">This is the Description</p> */}
            <div style={{}}>
              <Terminal message={resMsg} />
            </div>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              {isRuning ? (
                <Tooltip content="Close the dialog, but the progress will keep in running...">
                  <Button icon="cross" onClick={closeRunDialog}>
                    {t("tile.btn.close")}
                  </Button>
                </Tooltip>
              ) : (
                <Button icon="cross" onClick={closeRunDialog}>
                  {t("tile.btn.close")}
                </Button>
              )}

              {isDry && (
                <Button icon="refresh" intent="success" onClick={startRun}>
                  {t("tile.btn.run")}
                </Button>
              )}
            </div>
          </div>
        </Dialog>
        <Alert
          confirmButtonText={t("run.btn.confirm")}
          icon="issue"
          isOpen={openAlert}
          intent={Intent.SUCCESS}
          cancelButtonText={t("run.btn.cancel")}
          onCancel={handleRunCancel}
          onConfirm={handleRunConfirm}
        >
          <p>{t("run.runTips")}</p>
        </Alert>

        <Alert
          confirmButtonText={t("run.btn.confirm")}
          icon="issue"
          isOpen={openRuningAlert}
          intent={Intent.WARNING}
          cancelButtonText={t("run.btn.cancel")}
          onCancel={handleCancelRuning}
          onConfirm={handleConfirmRuning}
        >
          <p>{t("run.isRuningTips")}</p>
        </Alert>
      </div>
    </div>
  );
};

export default HuConfig;
