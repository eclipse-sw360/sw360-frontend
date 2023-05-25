// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"
import ComponentAdvanceSearch from '@/components/component/component-advance-search/ComponentAdvanceSearch'
import ComponentsTable from '@/components/component/components-table/ComponentsTable'
import { ButtonGroup, Dropdown } from 'react-bootstrap'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { Session } from '@/object-types/Session'

interface Props {
  session? : Session
}

const ComponentIndex = ({ session }: Props) => {
  const t = useTranslations(COMMON_NAMESPACE);

  return (
    <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
      <div className='row'>
        <div className='col-2 sidebar'>
          <ComponentAdvanceSearch />
        </div>
        <div className='col'>
          <div className='btn-toolbar' role='toolbar'>
            <div className='btn-group' role='group'>
              <button type='button' className='btn btn-primary'>{t('Add Component')}</button>
              <button type='button' className='btn btn-secondary'>{t('Import SBOM')}</button>
            </div>
            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle className='btn btn-secondary'>{t('Export Spreadsheet')}</Dropdown.Toggle>
              <Dropdown.Menu >
                <Dropdown.Item style={{ fontSize: '15px', color: 'gray' }}>{t('Components Only')}</Dropdown.Item>
                <Dropdown.Item style={{ fontSize: '15px', color: 'gray' }}>{t('Components With Releases')}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className='row' style={{ marginBottom: '20px' }}>
            <ComponentsTable session={session}/>
          </div>
        </div>
      </div >
    </div >
  )
}

export default ComponentIndex