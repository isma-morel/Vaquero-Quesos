import React, { useState } from "react";

const useModal = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const handleModal = (e) => {
    setIsOpenModal(!isOpenModal);
  };

  return [isOpenModal, handleModal];
};

export default useModal;
