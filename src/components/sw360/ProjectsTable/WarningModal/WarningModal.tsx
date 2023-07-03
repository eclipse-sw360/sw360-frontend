import { Modal } from "react-bootstrap"
import { Button } from "react-bootstrap"
import styles from "./WarningModal.module.css"
import { AiOutlineWarning } from 'react-icons/ai'

export default function Warningmodal({ warningText, setShow, show } : {
    warningText: string,
    show: boolean,
    setShow: (show: boolean) => void
}) {
    return (
        <>
            <Modal 
                show={show} 
                onHide={() => setShow(false)}
                backdrop="static"
                centered
                size="lg"
            >
                <Modal.Header className={`${styles["warning-title"]}`} closeButton>
                <Modal.Title>< AiOutlineWarning />Warning</Modal.Title>
                </Modal.Header>
                <Modal.Body>{warningText}</Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShow(false)} className={`fw-bold ${styles['button-plain']}`}>Ok</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}