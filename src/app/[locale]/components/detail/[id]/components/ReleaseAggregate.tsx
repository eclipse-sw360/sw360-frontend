// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"
import { useTranslations } from 'next-intl';
import styles from '../detail.module.css'
import { useState } from 'react'
import { COMMON_NAMESPACE } from '@/object-types/Constants';

const ReleaseAgrregate = ({ component }: any) => {
  const [toggle, setToggle] = useState(false);
  const t = useTranslations(COMMON_NAMESPACE)

  return (
    <table className={`table label-value-table ${styles['summary-table']}`}>
      <thead title='Click to expand or collapse' onClick={() => { setToggle(!toggle) }}>
        <tr>
          <th colSpan={2}>{t('Release Aggregate Data')}</th>
        </tr>
      </thead>
      <tbody hidden={toggle}>
        <tr>
          <td>{t('Vendors')}:</td>
          <td>{(component['sw360:vendors']) && component['sw360:vendors']}</td>
        </tr>
        <tr>
          <td>{t('Languages')}:</td>
          <td>{(component.languages) && component.languages.join(', ')}</td>
        </tr>
        <tr>
          <td>{t('Platforms')}:</td>
          <td>{(component.softwarePlatforms && component.softwarePlatforms.join(', '))}</td>
        </tr>
        <tr>
          <td>{t('Operating Systems')}:</td>
          <td>{(component.operatingSystems) && component.operatingSystems.join(', ')}</td>
        </tr>
        <tr>
          <td>{t('Main Licenses')}:</td>
          <td>{(component.mainLicenseIds) && component.mainLicenseIds.join(', ')}</td>
        </tr>
      </tbody>
    </table>
  )
}

export default ReleaseAgrregate