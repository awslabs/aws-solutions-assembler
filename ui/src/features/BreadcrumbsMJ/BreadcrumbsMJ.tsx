import React from "react";
import { Breadcrumbs } from "@blueprintjs/core";

interface BreadcrumbType {
  breadItems: any;
}
const BreadcrumbsMJ: React.FC<BreadcrumbType> = props => {
  const { breadItems } = props;
  return <Breadcrumbs items={breadItems} />;
};

export default BreadcrumbsMJ;
