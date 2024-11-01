// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import styles from './SideBar.module.css'

import { CommonTabIds, LinkedVulnerability, ReleaseTabIds, VulnerabilitiesVerificationState } from '@/object-types'
import { CommonUtils } from '@/utils'

interface Tab {
    name: string
    id: string
}

interface Props {
    selectedTab: string
    setSelectedTab: React.Dispatch<React.SetStateAction<string>>
    tabList: Array<Tab>
    vulnerabilities?: Array<LinkedVulnerability>
    eccStatus?: string
}

const SideBar = ({ selectedTab, setSelectedTab, tabList, vulnerabilities, eccStatus }: Props): JSX.Element => {
    const [numberOfCheckedOrUncheckedVulnerabilities, setNumberOfCheckedOrUncheckedVulnerabilities] = useState(0)
    const [numberOfIncorrectVulnerabilities, setNumberOfIncorrectVulnerabilities] = useState(0)
    const t = useTranslations('default')

    useEffect(() => {
        if (!CommonUtils.isNullEmptyOrUndefinedArray(vulnerabilities)) {
            let numberOfCheckOrUnchecked = 0
            let numberOfIncorrect = 0
            vulnerabilities.forEach((vulnerability: LinkedVulnerability) => {
                const verificationState =
                    vulnerability.releaseVulnerabilityRelation.verificationStateInfo?.at(-1)?.verificationState
                if (
                    verificationState == VulnerabilitiesVerificationState.CHECKED ||
                    verificationState == VulnerabilitiesVerificationState.NOT_CHECKED
                ) {
                    numberOfCheckOrUnchecked++
                } else {
                    numberOfIncorrect++
                }
            })
            setNumberOfCheckedOrUncheckedVulnerabilities(numberOfCheckOrUnchecked)
            setNumberOfIncorrectVulnerabilities(numberOfIncorrect)
        }
    }, [numberOfCheckedOrUncheckedVulnerabilities, numberOfIncorrectVulnerabilities, vulnerabilities])

    const handleSelectTab = (event: React.MouseEvent<HTMLElement>) => {
        setSelectedTab(event.currentTarget.id)
    }

    const createMenuBar = () => {
        const elements: JSX.Element[] = Object.entries(tabList).map(([index, tab]: [string, Tab]) => {
            if (tab.id === CommonTabIds.VULNERABILITIES) {
                return (
                    <a
                        key={index}
                        className={`list-group-item ${styles.tab} ${selectedTab === tab.id ? styles.active : ''}`}
                        id={tab.id}
                        onClick={handleSelectTab}
                    >
                        {
                            t(tab.name as never)
                        }
                        <span id={styles.numberOfVulnerabilitiesDiv} className='badge badge-light'>
                            {`${numberOfCheckedOrUncheckedVulnerabilities} + ${numberOfIncorrectVulnerabilities}`}
                        </span>
                    </a>
                )
            } else if (tab.id === ReleaseTabIds.ECC_DETAILS) {
                return (
                    <a
                        key={index}
                        className={`list-group-item ${styles.tab} ${selectedTab === tab.id ? styles.active : ''}`}
                        id={tab.id}
                        onClick={handleSelectTab}
                    >
                        {tab.name} <span className={`${styles[eccStatus ?? '']}`}></span>
                    </a>
                )
            }
            return (
                <a
                    key={index}
                    className={`list-group-item ${styles.tab} ${selectedTab === tab.id ? styles.active : ''}`}
                    id={tab.id}
                    onClick={handleSelectTab}
                >
                    {
                        t(tab.name as never)
                    }
                </a>
            )
        })

        return elements
    }

    return (
        <div id='detailTab' className='list-group' data-initial-tab={selectedTab} role='tablist'>
            {createMenuBar()}
        </div>
    )
}

export default SideBar
