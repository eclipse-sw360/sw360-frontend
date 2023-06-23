// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useState } from "react"
import { VerificationStateInfo } from "@/object-types/LinkedVulnerability"
import { ReactNode } from 'react'
import styles from './VerificationTooltip.module.css'

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