import { FiEdit2 } from 'react-icons/fi'
import { RiTaskLine } from 'react-icons/ri'
import { BsClipboard } from 'react-icons/bs'
import { MdDeleteOutline } from 'react-icons/md'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import Link from 'next/link'
import styles from './Actions.module.css'
import { useState } from "react"
import { WarningModal } from '@/components/sw360' 
import { DeleteModal } from '@/components/sw360' 

export default function Actions() {

  const [showWarningModal, setShowWarningModal] = useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)

  return (
      <>
        <WarningModal warningText='You do not have WRITE access to the project!' show={showWarningModal} setShow={setShowWarningModal}/>
        <DeleteModal show={showDeleteModal} setShow={setShowDeleteModal}/>

        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
          <span className="d-inline-block">
            <Link href="#">< FiEdit2 size={25} className={`ml-2 ${styles["icon-link"]}`} /></Link>
          </span>
        </OverlayTrigger>
        
        <OverlayTrigger overlay={<Tooltip>Create Clearing Request</Tooltip>}>
          <span className="d-inline-block">
            < RiTaskLine size={25} className={`ml-2 ${styles["icon-link"]}`} onClick={() => setShowWarningModal(true)} />
          </span>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Duplicate</Tooltip>}>
          <span className="d-inline-block">
            <Link href="#">< BsClipboard size={25} className={`ml-2 ${styles["icon-link"]}`} /></Link>
          </span>
        </OverlayTrigger>

        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
          <span className="d-inline-block">
            < MdDeleteOutline size={25} className={`ml-2 ${styles["icon-link"]}`} onClick={() => setShowDeleteModal(true)} />
          </span>
        </OverlayTrigger>
      </>
  )
}