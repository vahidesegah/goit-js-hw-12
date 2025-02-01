import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <p className="text-xl">Loading images, please wait...</p>
    </div>
  );
};

export default Loader;
