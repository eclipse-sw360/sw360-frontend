import { useState } from "react"
import { VerificationStateInfo } from "@/object-types/LinkedVulnerability"
import { ReactNode } from 'react'
import styles from './VerificationTooltip.module.css'
import { info } from "console"

interface Props {
  verificationStateInfos: Array<VerificationStateInfo>
  children: ReactNode
}

const VerificationStateFormater = ({ stateInfo }: { stateInfo: VerificationStateInfo }) => {
  return (
    <li>
      <span className={styles.formatedMessageForVulHeader}>
        <b>{stateInfo.verificationState} </b>
        <span className="formatedMessageForVulDate">({stateInfo.checkedOn})</span>
      </span>
      <span className={styles.formatedMessageForVulItem}>
        <i>Checked By: </i>
        <span>{stateInfo.checkedBy}</span>
      </span>
      <span className={styles.formatedMessageForVulItem}>
        <i>Action: </i>
        <span></span>
      </span>
      <span className={styles.formatedMessageForVulItem}>
        <p>
          <i>Comment: </i>
          {stateInfo.comment}
        </p>
      </span>
    </li>
  )
}

const VerificationTooltip = ({verificationStateInfos, children}: Props) => {
  const [show, setShow] = useState(false)
  return (
    <div className={styles.tooltip}
        onMouseOver={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
    >
      {show &&
          <div className={`${styles['tooltip-content']}`}>
              <ol className={styles.formatedMessageForVul} reversed>
                {
                  Object.entries(verificationStateInfos.slice().reverse())
                        .map(([index, info]: any) => 
                            <VerificationStateFormater key={index} stateInfo={info}/>)
                }
              </ol>
          </div>
      }
      {children}
    </div>
  )
}

export default VerificationTooltip