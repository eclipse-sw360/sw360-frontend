// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import AddKeyValueComponent from '@/components/AddKeyValue'
import AddAdditionalRolesComponent from '@/components/AddAdditionalRoles'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import ReleaseSummary from './ReleaseSummary'
import ReleaseRepository from './ReleaseRepository'

export default function ReleaseAddSummary() {
    const t = useTranslations(COMMON_NAMESPACE)

    return (
        <>
            <form
                action=''
                id='form_submit'
                method='post'
                onSubmit={(e) => {
                    e.preventDefault()
                }}
            >
                <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
                    <div className='row'>
                        <div className='col' style={{ fontSize: '0.875rem' }}>
                            <ReleaseSummary />
                            <div className='row mb-4'>
                                <AddAdditionalRolesComponent documentType={DocumentTypes.COMPONENT} />
                            </div>
                            <div className='row mb-4'>
                                <AddKeyValueComponent header={t('External ids')} keyName={'external id'} />
                            </div>
                            <div className='row mb-4'>
                                <AddKeyValueComponent header={t('Additional Data')} keyName={'additional data'} />
                            </div>
                            <ReleaseRepository />
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}
