export interface HuInfoType {
  id: string;
  version: string;
}

export interface TileInfoType {
  id: string;
  version: string;
  huId: string;
  huVersion: string;
}

export interface HuDetailType {
  content?: any;
  huWithTile: object;
  GETState?: any; //主要这段代码
}

export interface TileDetailType {
  content?: any;
  tileAndDependencies: object;
  GETState?: any; //主要这段代码
}

export interface TabInfo {
  isMax?: boolean;
  content?: any;
  tabInfo: string;
  initContent?: any;
  jsonContent?: any;
  GETState?: any; //主要这段代码
}
