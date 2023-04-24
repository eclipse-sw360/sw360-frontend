// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useTranslations } from "next-intl";
import { COMMON_NAMESPACE } from "@/object-types/Constants";

interface Props {
  show?: boolean,
  setShow?: React.Dispatch<React.SetStateAction<boolean>>,
  state: string,
}

const ChangeStateDialog = ({ show, setShow, state }: Props) => {
  const t = useTranslations(COMMON_NAMESPACE);

  const handleCloseDialog = () => {
    setShow(!show);
  }

  return (
    <Modal
      show={show}
      onHide={handleCloseDialog}
      backdrop='static'
      centered
      size='lg'
    >
      <Modal.Header closeButton>
        <Modal.Title>Change Vulnerability Rating And Action?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          The verification of <b>0</b> vulnerabilities will be changed to <b>{t(state)}</b>.
          <hr />
          <Form.Group className='mb-3'>
            <Form.Label style={{ fontWeight: 'bold' }}>{t('Please comment your changes')}</Form.Label>
            <Form.Control as="textarea" aria-label="With textarea" size='lg'/>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className='justify-content-end' >
        <Button className='delete-btn' variant='light' onClick={handleCloseDialog}> {t('Close')} </Button>
        <Button className='login-btn' variant='primary'>{t('Change State')}</Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ChangeStateDialog