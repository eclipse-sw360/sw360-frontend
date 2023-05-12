// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { authOptions } from '@/pages/api/auth/[...nextauth]'
import ComponentAdvanceSearch from '@/components/component/advance.search'
import { getServerSession } from 'next-auth/next'
import ListComponentTable from '@/components/component/list.components'
import { ButtonGroup, Dropdown } from 'react-bootstrap'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'next/head'

const ComponentIndex = ({ session }: any) => {
  const { t } = useTranslation('common');

  return (
    <>
      <Head>
        <title>Components - SW360</title>
      </Head>
      <div className='container' style={{ maxWidth: '94vw', marginTop: '10px' }}>
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
              <ListComponentTable session={session} />
            </div>
          </div>
        </div >
      </div >
    </>
  )
}

export async function getServerSideProps({ req, res, locale }: any) {
  const session: any = await getServerSession(req, res, authOptions);
  let props: any = {
    session: session,
    ...(await serverSideTranslations(locale, ['common'])),
  }

  return {
    props: props
  }
}

export default ComponentIndex