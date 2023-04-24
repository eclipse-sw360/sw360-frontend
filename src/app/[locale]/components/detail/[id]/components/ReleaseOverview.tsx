// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"
import { Grid, _ } from 'gridjs-react'
import Form from 'react-bootstrap/Form'
import { useEffect, useState, useCallback } from 'react'
import CommonUtils from '@/utils/common.utils'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import { signOut } from 'next-auth/react'
import { notFound } from 'next/navigation'
import { Session } from '@/object-types/Session'
import ReleaseLink from '@/object-types/ReleaseLink'
import { FaTrashAlt, FaPencilAlt } from 'react-icons/fa'

interface Props {
  session: Session,
  componentId: string,
}

const ReleaseOverview = ({ session, componentId }: Props) => {
  const t = useTranslations(COMMON_NAMESPACE);
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  const changePageSize = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(event.target.value))
  }

  const fetchData: any = useCallback(async (url: string) => {
    const response = await ApiUtils.GET(url, session.user.access_token)
    if (response.status == HttpStatus.OK) {
      const data = await response.json();
      return data;
    } else if (response.status == HttpStatus.UNAUTHORIZED) {
      signOut();
    } else {
      notFound();
    }
  }, [session.user.access_token])

  useEffect(() => {
    fetchData(`components/${componentId}/releases`).then((releaseLinks: any) => {
      if (!CommonUtils.isNullOrUndefined(releaseLinks['_embedded'])
        && !CommonUtils.isNullOrUndefined(releaseLinks['_embedded']['sw360:releaseLinks'])) {
        const data = releaseLinks['_embedded']['sw360:releaseLinks'].map((item: ReleaseLink) =>
          [item.name, [item.id, item.version], t(item.clearingState), t(item.clearingReport.clearingReportStatus), t(item.mainlineState), item.id])
        setData(data)
        setTotalRows(data.length)
      }
    })
  }, []);

  return (
    <>
      <div className='row'>
        <div className='col-11'>
          <div className='dataTables_length'>
            <span>{t('Show')} </span>
            <label style={{ marginLeft: '5px' }}>
              <Form.Select onChange={changePageSize} size='sm'>
                <option value='10'>10</option>
                <option value='20'>20</option>
                <option value={totalRows}>All</option>
              </Form.Select>
            </label>
            <span> {t('entries')}</span>
          </div>
        </div>
        <div className='col-1'>
          Print
        </div>
      </div>
      <div className='row'>
        <Grid
          data={data}
          search={true}
          pagination={{
            limit: pageSize,
          }}
          columns={[
            {
              name: t('Name'),
              sort: true
            },
            {
              name: t('Version'),
              formatter: ([id, version]: Array<string>) => _(<Link href={'/releases/detail/' + id} className='link'>{version}</Link>),
              sort: true
            },
            {
              name: t('Clearing State'),
              sort: true
            },
            {
              name: t('Clearing Report'),
              sort: true
            },
            {
              name: t('Release Mainline State'),
              sort: true
            },
            {
              name: t('Actions'),
              formatter: (id: string) => _(<span>
                <Link href={'/release/edit/' + id} style={{ color: 'gray', fontSize: '14px' }}><FaPencilAlt /></Link> &nbsp;
                <FaTrashAlt style={{ color: 'gray', fontSize: '14px' }} />
              </span>),
            }
          ]}

          style={{
            header: {
              display: 'block',
              width: 'fit-content',
              float: 'right'
            }
          }}
        />
      </div>
    </>
  )
}

export default ReleaseOverview;