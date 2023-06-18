// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import ComponentAdvanceSearch from '@/components/component/component-advance-search/ComponentAdvanceSearch'
import ComponentsTable from '@/components/component/components-table/ComponentsTable'
import { Dropdown } from 'react-bootstrap'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { Session } from '@/object-types/Session'

import { PageButtonHeader } from '@/components/sw360'

interface Props {
    session?: Session
    length?: number
}

const ComponentIndex = ({ session }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)

    const headerbuttons = {
        'Add Component': { link: '/projects/add', type: 'primary' },
        'Import SBOM': { link: '/projects', type: 'secondary' },
    }

    return (
        <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
            <div className='row'>
                <div className='col-2 sidebar'>
                    <ComponentAdvanceSearch />
                </div>
                <div className='col'>
                    <PageButtonHeader title={`${t('Components')} (0)`} buttons={headerbuttons}>
                        <div style={{ marginLeft: '5px' }} className='btn-group' role='group'>
                            <Dropdown>
                                <Dropdown.Toggle variant='secondary' id='project-export'>
                                    {t('Export Spreadsheet')}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item>{t('Components only')}</Dropdown.Item>
                                    <Dropdown.Item>{t('Components with releases')}</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </PageButtonHeader>
                    <div className='row' style={{ marginBottom: '20px' }}>
                        <ComponentsTable session={session} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ComponentIndex
