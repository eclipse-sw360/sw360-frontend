// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"
import styles from './ComponentAdvanceSearch.module.css'
import { Form, Button } from 'react-bootstrap'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CommonUtils from '@/utils/common.utils'
import { FaInfoCircle } from 'react-icons/fa'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { useTranslations } from 'next-intl'

interface SearchParams {
  name?: string,
  categories?: string,
  type?: string,
  group?: string,
  languages?: string,
  softwarePlatform?: string,
  vendors?: string,
  operatingSystem?: string,
  mainLicenses?: string,
  createdBy?: string,
}

const ComponentAdvanceSearch = () => {
  const router = useRouter();
  const t = useTranslations(COMMON_NAMESPACE);
  const params =  Object.fromEntries(useSearchParams());
  const [searchParams, setSearchParam] = useState<SearchParams>(params);
  const [createdOnSearchOption, setCreatedOnSearchOption] = useState('');

  const handleSearchParam = (event: any) => {
    setSearchParam((prev: any) => ({
      ...prev,
      [event.target.name]: event.target.value
    }))
  }

  const changeCreatedOnSearchOption = (event: any) => {
    setCreatedOnSearchOption(event.target.value);
  }

  const submitSearch = () => {
    const currentUrl = new URL(window.location.href);
    const searchUrl = new URL(currentUrl.origin + currentUrl.pathname);
    Object.entries(searchParams).forEach(([key, value]: any) => {
      if (!CommonUtils.isNullEmptyOrUndefinedString(value)) {
        searchUrl.searchParams.append(key, value);
      }
    })

    const encodedUrl = encodeURI(searchUrl.toString());
    router.push(encodedUrl);
  }

  return (
    <div className={styles['card-deck']}>
      <div id='component-quickfilter' className='card'>
        <div className={styles['card-header']}>
          {t('Advance Search')}
        </div>
        <div className={styles['card-body']}>
          <Form>
            <Form.Group className='mb-3' controlId='componentName'>
              <Form.Label className={styles['label']}>{t('Component Name')}</Form.Label>
              <Form.Control type='text' size='sm' name='name' value={searchParams.name}
                onChange={handleSearchParam} />
            </Form.Group>
            <Form.Group className='mb-3' controlId='categories'>
              <Form.Label className={styles['label']}>{t('Categories')}</Form.Label>
              <Form.Control type='text' size='sm' name='categories' value={searchParams.categories}
                onChange={handleSearchParam} />
            </Form.Group>
            <Form.Group className='mb-3' controlId='type'>
              <Form.Label className={styles['label']}>{t('Component Type')}</Form.Label>
              <Form.Select size='sm' name='type' onChange={handleSearchParam} value={searchParams.type}>
                <option value={''}></option>
                <option value={'OSS'}> OSS </option>
                <option value={'COTS'}> COTS </option>
                <option value={'INTERNAL'}> {t('Internal')} </option>
                <option value={'INNER_SOURCE'}> {t('Inner Source')} </option>
                <option value={'SERVICE'}> {t('Service')} </option>
                <option value={'FREESOFTWARE'}> {t('Freeware')} </option>
                <option value={'CODE_SNIPPET'}> {t('Code Snippet')} </option>
              </Form.Select>
            </Form.Group>
            <Form.Group className='mb-3' controlId='group'>
              <Form.Label className={styles['label']}>{t('Group')}</Form.Label>
              <Form.Select size='sm' name='group' onChange={handleSearchParam} value={searchParams.group}>
                <option value={''}></option>
              </Form.Select>
            </Form.Group>
            <Form.Group className='mb-3' controlId='languages' >
              <Form.Label className={styles['label']}>{t('Languages')}</Form.Label>
              <Form.Control type='text' size='sm' name='languages' value={searchParams.languages}
                onChange={handleSearchParam} />
            </Form.Group>
            <Form.Group className='mb-3' controlId='softwarePlatform'>
              <Form.Label className={styles['label']}>{t('Software Platforms')}</Form.Label>
              <Form.Control type='text' size='sm' name='softwarePlatform' value={searchParams.softwarePlatform}
                onChange={handleSearchParam} />
            </Form.Group>
            <Form.Group className='mb-3' controlId='vendors'>
              <Form.Label className={styles['label']}>{t('Vendors')}</Form.Label>
              <Form.Control type='text' size='sm' name='vendors' value={searchParams.vendors}
                onChange={handleSearchParam} />
            </Form.Group>
            <Form.Group className='mb-3' controlId='operatingSystem'>
              <Form.Label className={styles['label']}>{t('Operating Systems')}</Form.Label>
              <Form.Control type='text' size='sm' name='operatingSystem' value={searchParams.operatingSystem}
                onChange={handleSearchParam} />
            </Form.Group>
            <Form.Group className='mb-3' controlId='mainLicenses'>
              <Form.Label className={styles['label']}>{t('Main Licenses')}</Form.Label>
              <Form.Control type='text' size='sm' name='mainLicenses' value={searchParams.mainLicenses}
                onChange={handleSearchParam} />
            </Form.Group>
            <Form.Group className='mb-3' controlId='createdBy'>
              <Form.Label className={styles['label']}>{t('Created By (Email)')}</Form.Label>
              <Form.Control type='email' size='sm' name='createdBy' value={searchParams.createdBy}
                onChange={handleSearchParam} />
            </Form.Group>
            <Form.Group className='mb-3' controlId='createdOn'>
              <Form.Label className={`${styles['create-on-label']} mb-0 `}>{t('Created On')}</Form.Label>
              <Form.Select size='sm' style={{ display: 'inline-block', width: '40% !important' }} onChange={changeCreatedOnSearchOption}>
                <option value={''}></option>
                <option value={'EQUAL'}> {'='} </option>
                <option value={'LESS_THAN_OR_EQUAL_TO'}> {'<='} </option>
                <option value={'GREATER_THAN_OR_EQUAL_TO'}> {'>='} </option>
                <option value={'BETWEEN'}> {t('Between')} </option>
              </Form.Select>
            </Form.Group>

            {(createdOnSearchOption !== 'BETWEEN' && createdOnSearchOption !== '') && (
              <Form.Group className='mb-3'>
                <Form.Control type='date' size='sm' />
              </Form.Group>
            )}

            {(createdOnSearchOption === 'BETWEEN') && (
              <>
                <Form.Group className='mb-3'>
                  <Form.Control type='date' size='sm' />
                </Form.Group>
                <Form.Group className='mb-3'>
                  <Form.Label className={styles['label']}>{t('To')}</Form.Label>
                  <Form.Control type='date' size='sm' />
                </Form.Group>
              </>
            )}
            <Form.Group className='mb-3'>
              <Form.Check type='checkbox' label='Exact Match' style={{ fontWeight: 'bold', fontSize: '14px', display: 'inline-block', marginRight: '5px' }} />
              <FaInfoCircle className={styles['info-icon']} />
              <div className={styles['popup']}>
                The search result will display elements exactly matching the input. Equivalent to using (&quot;) around
                the search keyword. Applied on Component Name.
              </div>
            </Form.Group>
            <Form.Group>
              <Button size='sm' style={{ backgroundColor: '#F7941E', width: '100%' }} onClick={submitSearch}>
                {t('Search')}
              </Button>
            </Form.Group>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default ComponentAdvanceSearch