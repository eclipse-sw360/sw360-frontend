// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { ShowInfoOnHover } from 'next-sw360'
import type { JSX } from 'react'
import { Table } from 'react-bootstrap'
import { MainlineState, ReleaseRelationship } from '@/object-types'

const LinkedReleasesTable = ({ children }: { children: React.ReactNode }): JSX.Element => {
    return (
        <Table>
            <TableHeader />
            {children}
        </Table>
    )
}

const TableHeader = () => {
    const t = useTranslations('default')
    return (
        <thead>
            <tr>
                <th className='text-capitalize'>{t('Release name')}</th>
                <th className='text-capitalize'>{t('Release version')}</th>
                <th
                    style={{
                        width: '5%',
                    }}
                >
                    <div>
                        <span>{t('Reload Info')}</span> <ShowInfoOnHover text={t('Load default child releases')} />
                    </div>
                </th>
                <th>
                    <div>
                        <span className='text-capitalize'>{t('Release Relation')} </span>
                        <ShowInfoOnHover
                            text={Object.values(ReleaseRelationship).map((rel) => {
                                let tag = rel.toString()
                                if (rel === ReleaseRelationship.REFERRED) {
                                    tag = 'Related'
                                }
                                return (
                                    <>
                                        <b>{t(tag)}</b>: {t(`release_relation_${rel.toLowerCase()}_tooltip`)}
                                        <br />
                                    </>
                                )
                            })}
                        />
                    </div>
                </th>
                <th>
                    <div>
                        <span className='text-capitalize'>{t('Project Mainline State')} </span>
                        <ShowInfoOnHover
                            text={Object.values(MainlineState).map((state) => (
                                <>
                                    <b>{t(state)}</b>: {t(`mainline_state_${state.toLowerCase()}_tooltip`)}
                                    <br />
                                </>
                            ))}
                        />
                    </div>
                </th>
                <th>{t('Comments')}</th>
                <th
                    style={{
                        width: '5%',
                    }}
                >
                    {''}
                </th>
            </tr>
        </thead>
    )
}

export default LinkedReleasesTable
