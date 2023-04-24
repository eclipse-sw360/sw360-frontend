// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Alert from 'react-bootstrap/Alert'
import { Grid } from 'gridjs-react'
import Form from 'react-bootstrap/Form'
import { useEffect, useState, useCallback } from 'react'
import CommonUtils from '@/utils/common.utils'
import { _ } from 'gridjs-react'
import { FaDownload } from 'react-icons/fa'
import styles from './Attachment.module.css'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import ApiUtils from '@/utils/api/api.util'
import { Session } from '@/object-types/Session'
import { signOut } from 'next-auth/react'
import HttpStatus from '@/object-types/enums/HttpStatus'
import { notFound } from 'next/navigation'
import Attachment from '@/object-types/Attachment'

interface Props {
  componentId: string,
  session: Session,
}

const Attachments = ({ componentId, session }: Props) => {
  const t = useTranslations(COMMON_NAMESPACE);
  const [attachmentData, setAttachmentData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const changePageSize = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(event.target.value))
  }

  const buildAttachmentDetail = (item: any) => {
    return (event: any) => {
      if (event.target.className == styles.expand) {
        event.target.className = styles.collapse;
      } else {
        event.target.className = styles.expand;
      }

      const attachmentDetail = document.getElementById(item.sha1);
      if (!attachmentDetail) {
        const parent = event.target.parentElement.parentElement.parentElement;
        const html =
          `<td colspan="10">
            <table class="table table-borderless">
              <tr></tr>
              <tbody>
                <tr>
                  <td>SHA1 : </td>
                  <td>${item.sha1}</td>
                  <td>${t('Uploaded On')} : </td>
                  <td>${item.createdOn}</td>
                  <td>${t('Uploaded Comment')} : </td>
                  <td>${item.createdComment}</td>
                </tr>
                <tr>
                </tr>
                <tr>
                  <td>${t('Checked On')} : </td>
                  <td>${item.checkedOn}</td>
                  <td>${t('Checked Comment')} : </td>
                  <td>${item.checkedComment}</td>
                  <td></td>
                  <td></td>
                </tr>
                <tr></tr>
              </tbody>
            </table>
          </td>`
        const tr = document.createElement('tr');
        tr.id = item.sha1
        tr.innerHTML = html

        parent.parentNode.insertBefore(tr, parent.nextSibling);
      } else {
        if (attachmentDetail.hidden == true) {
          attachmentDetail.hidden = false;
        } else {
          attachmentDetail.hidden = true;
        }
      }
    }
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
    fetchData(`components/${componentId}/attachments`).then((attachments: any) => {
      if (!CommonUtils.isNullOrUndefined(attachments['_embedded'])
         && !CommonUtils.isNullOrUndefined(attachments['_embedded']['sw360:attachments'])) {
        const attachmentData = attachments['_embedded']['sw360:attachments'].map((item: Attachment) =>
          [item, item.filename, 'n/a', item.attachmentType, '', '', '', '', '', item]);
        setAttachmentData(attachmentData);
        setTotalRows(attachmentData.length);
      }
      })
  }, [componentId, fetchData])

  return (
    <>
      {(totalRows) ?
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
          <div className={`row ${styles['attachment-table']}`}>
            <Grid
              data={attachmentData}
              search={true}
              pagination={{
                limit: pageSize,
              }}
              columns={[
                {
                  name: _(<FaDownload className={styles['download-btn']} style={{ width: '100%' }} />),
                  formatter: (item: any) => _(
                    <i className={styles.collapse} onClick={buildAttachmentDetail(item)}></i>
                  )
                },
                {
                  name: t('File name'),
                  sort: true
                },
                {
                  name: t('Size'),
                  sort: true
                },
                {
                  name: t('Type'),
                  sort: true
                },
                {
                  name: t('Group'),
                  sort: true
                },
                {
                  name: t('Uploaded By'),
                  sort: true
                },
                {
                  name: t('Group'),
                  sort: true
                },
                {
                  name: t('Checked By'),
                  sort: true
                },
                {
                  name: t('Usage'),
                },
                {
                  name: t('Action'),
                  formatter:  (item: any) => _(<FaDownload className={styles['download-btn']} style={{ width: '100%' }} />)
                },
              ]}

              style={{
                header: {
                  display: 'block',
                  width: 'fit-content',
                  float: 'right'
                },
              }}
            />
          </div>
        </> :
        <div className='col'>
          <Alert variant='primary'>
            {t('No attachments yet')}
          </Alert>
        </div>
      }
    </>
  )
}

export default Attachments;