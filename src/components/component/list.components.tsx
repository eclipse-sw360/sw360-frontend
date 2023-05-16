// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import CommonUtils from '@/utils/common.utils'
import { FaTrashAlt, FaPencilAlt } from 'react-icons/fa'
import { Grid, _ } from 'gridjs-react'
import { Form } from 'react-bootstrap'
import Link from 'next/link';
import { useEffect, useState } from 'react'
import styles from './styles/ListComponentTable.module.css'
import { signOut } from 'next-auth/react'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import PageSpinner from '@/components/common/spinner'
import { useRouter } from 'next/router'
import DeleteComponentDialog from './delete.component.dialog'
import { useTranslation } from 'next-i18next'
import { useCallback } from 'react';

const ListComponentTable = ({ session }: any) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const params = router.query;
  const [componentData, setComponentData] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingComponent, setDeletingComponent] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const changePageSize = (event: any) => {
    setPageSize(event.target.value)
  }

  const handleClickDelete = (componentId: any) => {
    setDeletingComponent(componentId);
    setDeleteDialogOpen(true);
  }

  const fetchData: any = useCallback(async (queryUrl: string, signal: any) => {
    const componentsResponse = await ApiUtils.GET(queryUrl, session.user.access_token, signal);
    if (componentsResponse.status == HttpStatus.OK) {
      const components = await componentsResponse.json();
      return components;
    } else if (componentsResponse.status == HttpStatus.UNAUTHORIZED) {
      signOut();
    } else {
      return [];
    }
  }, [session.user.access_token])

  useEffect(() => {
    setLoading(true);
    const queryUrl = CommonUtils.createUrlWithParams('components', params);
    const data: any = [];

    const parseTableRowData = (item: any) => {
      data.push([
        (!CommonUtils.isNullOrUndefined(item.defaultVendor) ? item.defaultVendor.shortName : ''),
        [item.id, item.name],
        (!CommonUtils.isNullOrUndefined(item.mainLicenseIds)) ? item.mainLicenseIds : [],
        item.componentType, [item.id, item.name]]);
    }

    const controller = new AbortController()
    const signal = controller.signal;
    fetchData(queryUrl, signal).then((components: any) => {
      console.log("-----------------");
      console.log(components);
      if (!CommonUtils.isNullOrUndefined(components['_embedded']['sw360:components'])) {
        components['_embedded']['sw360:components'].forEach(parseTableRowData);
        setComponentData(data);
        setTotalRows(data.length);
        setLoading(false);
      }
    });

    return () => {
      controller.abort();
    }
  }, [fetchData, params]);

  return (
    <>
      <div className='row'>
        <div className='col-11 mt-3 mb-3'>
          <div className='dataTables_length'>
            <span>{t('Show')} </span>
            <label style={{ marginLeft: '5px' }}>
              <Form.Select size='sm' onChange={changePageSize}>
                <option value='10'>10</option>
                <option value='25'>25</option>
                <option value='50'>50</option>
                <option value='100'>100</option>
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
        {(loading == false) ?
          <Grid
            data={componentData}
            pagination={{
              limit: pageSize,
            }}
            columns={[
              {
                name: t('Vendor'),
                sort: true
              },
              {
                name: t('Component Name'),
                formatter: ([id, name]: any) => _(<Link href={'/components/detail/' + id} className='link'>{name}</Link>),
                sort: true
              },
              {
                name: t('Main Licenses'),
                formatter: (licenseIds: any) => (licenseIds.length > 0) && _(Object.entries(licenseIds)
                  .map(([index, item]: any) => <Link key={item} className='link' href={'/licenses/' + item}> {item} </Link>)
                  .reduce((prev, curr): any => [prev, ', ', curr])),
                sort: true
              },
              {
                name: t('Component Type'),
                sort: true
              },
              {
                name: t('Actions'),
                formatter: ([id, name]: any) => _(<span>
                  <Link href={'/components/edit/' + id} style={{ color: 'gray', fontSize: '14px' }}><FaPencilAlt /></Link> &nbsp;
                  <FaTrashAlt className={styles['delete-btn']} onClick={() => handleClickDelete(id)} />
                </span>),
              }
            ]}

            style={{
              table: {
                'font-size': '14px'
              },
              th: {
                'background-color': '#5D8EA9',
                color: 'white'
              },
              header: {
                display: 'block',
                width: 'fit-content',
                float: 'right'
              },
              footer: {
                'border-radius': '0px',
                'font-size': '14px'
              }
            }}
            className={{
              table: styles.components
            }}
          />
          :
          <div className='col-12' style={{ textAlign: 'center' }}>
            <PageSpinner />
          </div>
        }
      </div>
      <DeleteComponentDialog componentId={deletingComponent} show={deleteDialogOpen} setShow={setDeleteDialogOpen} />
    </>
  )
}

export default ListComponentTable