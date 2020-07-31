import React from "react";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const MahjongLoading: React.FC = () => {
  return (
    <div style={{ textAlign: "center", margin: "40px auto" }}>
      <Loader type="ThreeDots" color="#00BFFF" height={50} width={50} />
    </div>
  );
};

export default MahjongLoading;
