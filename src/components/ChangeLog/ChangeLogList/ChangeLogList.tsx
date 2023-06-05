// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Grid, _ } from 'gridjs-react'
import Form from 'react-bootstrap/Form'
import { useEffect, useState } from 'react'
import { FaFileAlt } from 'react-icons/fa'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

interface Props {
  documentId: string,
  setChangeLogIndex: any,
  setChangesLogTab: any,
  changeLogList: Array<any>
}

const ChangeLogList = ({ documentId, setChangeLogIndex, setChangesLogTab, changeLogList }: Props) => {
  const t = useTranslations(COMMON_NAMESPACE);
  const [changeLogData, setChangeLogData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const changePageSize = (event: any) => {
    setPageSize(event.target.value)
  }

  useEffect(() => {
    const data = Object.entries(changeLogList).map(([index, item]: any) => [
      item.changeTimestamp, item.id,
      (item.documentId === documentId) ? t('Attributes change') : `${t('Reference Doc Changes')} : ${item.documentType}`,
      item.userEdited, index]);
    setChangeLogData(data);
    setTotalRows(data.length);
  }, [documentId]);

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
            <span>  {t('entries')}</span>
          </div>
        </div>
        <div className='col-1'>
          Print
        </div>
      </div>
      <div className='row'>
        <Grid
          data={changeLogData}
          columns={[
            {
              name: t('Date'),
              sort: true
            },
            {
              name: t('Change Log Id'),
              sort: true
            },
            {
              name: t('Change Type'),
              sort: true
            },
            {
              name: t('User'),
              sort: true
            },
            {
              name: t('Actions'),
              formatter: (index: any) => _(<FaFileAlt style={{ color: '#F7941E', fontSize: '18px' }} onClick={() => { setChangeLogIndex(index); setChangesLogTab('view-log') }} />)
            }
          ]}
          search={true}
          pagination={{
            limit: pageSize,
          }}

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

export default ChangeLogList;