import React, { useEffect, useState } from "react";
import { FormGroup } from "@blueprintjs/core";
import { useForm } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";

import "./HuConfig.scss";

import { TabInfo } from "../../../../interface";

const HuConfigForm: React.FC<TabInfo> = (props: any) => {
  const { tabInfo, jsonContent } = props;

  const [formItemTileList, setFormItemTileList] = useState<any>();
  const [formData, setFormData] = useState<any>();
  const [copiedJson, setCopiedJson] = useState<any>();
  const [curChangeInputName, setCurChangeInputName] = useState<any>("");
  const [curChangeInputValue, setCurChangeInputValue] = useState<any>("");

  const { register, setValue, handleSubmit } = useForm();
  const onSubmit = (data: any) => {
    setFormData(data);
  };

  useEffect(() => {
    if (jsonContent != null && jsonContent != undefined) {
      setFormItemTileList(jsonContent.spec.template.tiles);
      setCopiedJson(JSON.parse(JSON.stringify(jsonContent)));
    }
  }, [jsonContent]);

  useEffect(() => {
    if (
      copiedJson &&
      copiedJson.spec &&
      copiedJson.spec.template &&
      copiedJson.spec.template.tiles
    ) {
      // Start Set JSON View
      const nameArr = curChangeInputName.split("|");
      const tmpTileName = nameArr[0];
      const tmpParamName = nameArr[1];
      // const copiedJson.spec.template.tiles[tmpTileName]
      // foreach specific json tile and change the value
      copiedJson.spec.template.tiles[tmpTileName].inputs.forEach(
        (element: any) => {
          if (element.name === tmpParamName) {
            if (element.hasOwnProperty("inputValues")) {
              element.inputValues = curChangeInputValue.split(",");
            } else {
              element.inputValue = curChangeInputValue;
            }
          }
        }
      );
      setCopiedJson(copiedJson);
      props.GETState({ content: copiedJson });
    }
  }, [formData]);

  useEffect(() => {
    if (copiedJson) {
      const tmpObj = copiedJson.spec.template.tiles;
      Object.keys(tmpObj).map((key: any) => {
        if (tmpObj[key] && tmpObj[key].inputs) {
          tmpObj[key].inputs.forEach((element: any) => {
            const inputName = key + "|" + element.name;
            if (element.hasOwnProperty("inputValues")) {
              setValue(inputName, element.inputValues);
            } else {
              setValue(inputName, element.inputValue);
            }
          });
        }
      });
    }
  }, [tabInfo]);

  const changeInputValue = (event: any) => {
    const newInputValue = event.target.value;
    const inputName = event.target.name;
    setCurChangeInputName(inputName);
    setCurChangeInputValue(newInputValue);
    handleSubmit(onSubmit)();
  };

  return (
    <div>
      <div className="form-content">
        <form onSubmit={handleSubmit(onSubmit)}>
          <input style={{ display: "none" }} type="submit" />
          {formItemTileList &&
            Object.keys(formItemTileList).map((key: any) => {
              return (
                <div key={key}>
                  <div className="tile-name">{key}</div>
                  <div className="tile-params">
                    {formItemTileList[key].inputs.map(
                      (element: any, index: any) => {
                        let tmpValue = "";
                        if (element.hasOwnProperty("inputValues")) {
                          tmpValue = element.inputValues.toString();
                        } else {
                          tmpValue = element.inputValue.toString();
                        }
                        return (
                          <div key={index}>
                            <FormGroup label={element.name}>
                              {element.hasOwnProperty("inputValues") ? (
                                <TextareaAutosize
                                  className="bp3-input"
                                  minRows={2}
                                  style={{
                                    width: "100%"
                                  }}
                                  disabled={tmpValue.indexOf("$") === 0}
                                  name={key + "|" + element.name}
                                  ref={register}
                                  onBlur={changeInputValue}
                                  defaultValue={element.inputValues}
                                />
                              ) : (
                                <input
                                  className="bp3-input"
                                  style={{ width: "100%" }}
                                  disabled={tmpValue.indexOf("$") === 0}
                                  name={key + "|" + element.name}
                                  ref={register}
                                  onBlur={changeInputValue}
                                  defaultValue={element.inputValue}
                                />
                              )}
                            </FormGroup>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}
        </form>
      </div>
    </div>
  );
};

export default HuConfigForm;
