// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { type JSX } from 'react'
import ImportSecondaryDepartmentsSection from './components/ImportSecondaryDepartmentsSection'
import SecondaryDepartmentsTable from './components/SecondaryDepartmentsTable'

export const metadata: Metadata = {
    title: 'Departments',
}

const DepartmentAdministrationPage = async (): Promise<JSX.Element> => {
    const t = await getTranslations('default')

    return (
        <div className='container page-content'>
            <ImportSecondaryDepartmentsSection />
            <div className='row'>
                <div className='col-12'>
                    <h5 className='header-underlined'>{t('Department')}</h5>
                </div>
            </div>
            <div className='row'>
                <SecondaryDepartmentsTable />
            </div>
        </div>
    )
}

export default DepartmentAdministrationPage
