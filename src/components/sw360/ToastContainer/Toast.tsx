// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { SetStateAction, useState } from 'react';
import Toast from 'react-bootstrap/Toast';
// import '@/styles/globals.css'

interface ToastData {
  show: boolean;
  type: string;
  message: string;
}

interface ToastProps {
  show: boolean;
  type: string;
  message: string;
  onClose: () => void;
  setShowToast: React.Dispatch<SetStateAction<ToastData>>
}

const ToastMessage: React.FC<ToastProps> = ({ show, type, message , onClose, setShowToast }) => {

  const handleClose = () => {
    setShowToast({
      show: false,
      type: '',
      message: '',
    });
    onClose();
  };

  return (
    <Toast show={show} onClose={handleClose} delay={4000} bg='danger' autohide>
      <Toast.Header>
        <strong className={`text-${type}`}>{type === 'success' ? 'Success' : 'Error'}</strong>
      </Toast.Header>
      <Toast.Body className='text-white'>{message}</Toast.Body>
    </Toast>
  );
};

export default ToastMessage;
