// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Table } from 'react-bootstrap'
import { ShowInfoOnHover } from 'next-sw360'
import { useTranslations } from 'next-intl'

import type { JSX } from "react";

const LinkedReleasesTable = ({ children }: { children: React.ReactNode }) : JSX.Element => {
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
                <th className='text-capitalize'>
                    {t('Release name')}
                </th>
                <th className='text-capitalize'>
                    {t('Release version')}
                </th>
                <th style={{ width: '5%' }}>
                    <div>
                        <span>{t('Reload Info')}</span> <ShowInfoOnHover text={t('Load default child releases')} />
                    </div>
                </th>
                <th>
                    <div>
                        <span className='text-capitalize'>{t('Release Relation')}{' '}</span>
                        <ShowInfoOnHover text={
                            <>
                                <b>{t('UNKNOWN')}</b>: {t('release_relation_unknown_tooltip')}
                                <br /><b>{t('CONTAINED')}</b>: {t('release_relation_contained_tooltip')}
                                <br /><b>{t('REFERRED')}</b>: {t('release_relation_referred_tooltip')}
                                <br /><b>{t('DYNAMICALLY_LINKED')}</b>: {t('release_relation_dynamic_linked_tooltip')}
                                <br /><b>{t('STATICALLY_LINKED')}</b>: {t('release_relation_static_linked_tooltip')}
                                <br /><b>{t('SIDE_BY_SIDE')}</b>: {t('release_relation_side_by_side_tooltip')}
                                <br /><b>{t('STANDALONE')}</b>: {t('release_relation_standalone_tooltip')}
                                <br /><b>{t('INTERNAL_USE')}</b>: {t('release_relation_interal_use_tooltip')}
                                <br /><b>{t('OPTIONAL')}</b>: {t('release_relation_optional_tooltip')}
                                <br /><b>{t('TO_BE_REPLACED')}</b>: {t('release_relation_to_be_replaced_tooltip')}
                                <br /><b>{t('CODE_SNIPPET')}</b>: {t('release_relation_code_snippest_tooltip')}.
                            </>
                        }
                        />
                    </div>
                </th>
                <th>
                    <div>
                        <span className='text-capitalize'>{t('Project Mainline State')}{' '}</span>
                        <ShowInfoOnHover text={
                            <>
                                <b>{t('OPEN')}</b>: {t('mainline_state_open_tooltip')}
                                <br /><b>{t('MAINLINE')}</b>: {t('mainline_state_mainline_tooltip')}
                                <br /><b>{t('SPECIFIC')}</b>: {t('mainline_state_specific_tooltip')}
                                <br /><b>{t('PHASEOUT')}</b>: {t('mainline_state_phaseout_tooltip')}
                                <br /><b>{t('DENIED')}</b>: {t('mainline_state_denied_tooltip')}
                            </>
                        }
                        />
                    </div>
                </th>
                <th>
                    {t('Comments')}
                </th>
                <th style={{ width: '5%' }}>
                    {''}
                </th>
            </tr>
        </thead>
    )
}

export default LinkedReleasesTable
