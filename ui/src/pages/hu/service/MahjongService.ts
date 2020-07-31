import Axios from "./Axios";

const getAllHuList = () => {
  return Axios.get("/repo/hu");
};

const getHuDetailByNameAndVersion = (id: string, version: string) => {
  return Axios.get(`/repo/hu/${id}/${version}`);
};

const getTileDetailByNameAndVersion = (id: string, version: string) => {
  return Axios.get(`/repo/tile/${id}/${version}`);
};

const getHuYamlInfo = (id: string, version: string) => {
  return Axios.get(`/hu/${id}/${version}`);
};

const getTileYamlInfo = (id: string, version: string) => {
  return Axios.get(`/tile/${id}/${version}`);
};

const yamlToJson = (data: any) => {
  return Axios.post("/util/yaml2json", data);
};

const jsonToYaml = (data: any) => {
  return Axios.post("/util/json2yaml", data);
};

export default {
  getAllHuList,
  getHuDetailByNameAndVersion,
  getTileDetailByNameAndVersion,
  getHuYamlInfo,
  getTileYamlInfo,
  yamlToJson,
  jsonToYaml
};
