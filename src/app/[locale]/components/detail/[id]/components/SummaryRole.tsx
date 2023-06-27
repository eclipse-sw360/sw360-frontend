// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl';
import styles from '../detail.module.css'
import { useState } from 'react'
import { COMMON_NAMESPACE } from '@/object-types/Constants';

const SummaryRole = ({ component }: any) => {
  const t = useTranslations(COMMON_NAMESPACE)
  const [toggle, setToggle] = useState(false)

  return (
    <table className={`table label-value-table ${styles['summary-table']}`}>
      <thead title='Click to expand or collapse' onClick={() => { setToggle(!toggle) }}>
        <tr>
          <th colSpan={2}>{t('Roles')}</th>
        </tr>
      </thead>
      <tbody hidden={toggle}>
        <tr>
          <td>{t('Component Owner')}:</td>
          {(component.componentOwner) && <td>{component.componentOwner}</td>}
        </tr>
        <tr>
          <td>{t('Owner Accounting Unit')}:</td>
          {(component.ownerAccountingUnit) && <td>{component.ownerAccountingUnit}</td>}
        </tr>
        <tr>
          <td>{t('Owner Billing Group')}:</td>
          <td>{(component.ownerGroup) && component.ownerGroup}</td>
        </tr>
        <tr>
          <td>{t('Owner Country')}:</td>
          <td>{(component.ownerCountry) && component.ownerCountry}</td>
        </tr>
        <tr>
          <td>{t('Moderators')}:</td>
          {(component['_embedded']) && <td>{(component['_embedded']['sw360:moderators']) && 
            <a className={styles.link} href={`mailto:${component['_embedded']['sw360:moderators']['email']}`}>{component['_embedded']['createdBy']['fullName']}</a>
          } </td>}
        </tr>
        <tr>
          <td>{t('Subscribers')}:</td>
          <td>{(component.subscribers) && component.subscribers.join(', ')}</td>
        </tr>
        <tr>
          <td>{t('Additional Roles')}:</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  )
}

export default SummaryRole;