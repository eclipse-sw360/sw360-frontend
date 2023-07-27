// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { FiEdit2 } from 'react-icons/fi'
import { RiTaskLine } from 'react-icons/ri'
import { BsClipboard } from 'react-icons/bs'
import { MdDeleteOutline } from 'react-icons/md'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Link from 'next/link'
import { useState } from "react"
import WarningModal from '../WarningModal/WarningModal' 
import { DeleteProjectModal } from '@/components/sw360' 

export default function Actions() {

  const [showWarningModal, setShowWarningModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

  return (
      <>
        <WarningModal show={showWarningModal} setShow={setShowWarningModal}/>
        <DeleteProjectModal show={showDeleteModal} setShow={setShowDeleteModal}/>

        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
          <span className="d-inline-block">
            <Link href="#">< FiEdit2 size={20} className="btn-icon" /></Link>
          </span>
        </OverlayTrigger>
        
        <OverlayTrigger overlay={<Tooltip>Create Clearing Request</Tooltip>}>
          <span className="d-inline-block mx-1">
            < RiTaskLine size={20} className="btn-icon" onClick={() => setShowWarningModal(true)} />
          </span>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Duplicate</Tooltip>}>
          <span className="d-inline-block mx-1">
            <Link href="#">< BsClipboard size={20} className="btn-icon" /></Link>
          </span>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
          <span className="d-inline-block ml-1">
            < MdDeleteOutline size={20} className="btn-icon" onClick={() => setShowDeleteModal(true)} />
          </span>
        </OverlayTrigger>
      </>
  )
}