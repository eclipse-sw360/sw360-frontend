// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { AiOutlineTags, AiOutlineUnorderedList } from 'react-icons/ai'
import { BsBag, BsFileEarmarkText, BsFilter, BsSearch } from 'react-icons/bs'
import { FiEdit2 } from 'react-icons/fi'
import { HiOutlineDocumentDuplicate } from 'react-icons/hi'
import { ImUsers } from 'react-icons/im'
import { RiArrowUpDownFill, RiOrganizationChart } from 'react-icons/ri'
import { RxCalendar } from 'react-icons/rx'

const AdminMainPage = (): JSX.Element => {
    const t = useTranslations('default')

    return (
        <>
            <div className='mx-5 mt-3'>
                <div className='row d-flex justify-content-end buttonheader-title'>{t('ADMINISTRATION')}</div>
                <div className='mt-4 d-flex flex-wrap justify-content-center px-5 mx-auto'>
                    <Link href='/admin/users'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <ImUsers /> {t('User')}
                        </button>
                    </Link>
                    <Link href='#'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <RiOrganizationChart /> {t('Department')}
                        </button>
                    </Link>
                    <Link href='/admin/vendors'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <BsBag /> {t('Vendors')}
                        </button>
                    </Link>
                    <Link href='#'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <FiEdit2 /> {t('Bulk Release Edit')}
                        </button>
                    </Link>
                    <Link href='/admin/licenses'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <BsFileEarmarkText /> {t('Licenses')}
                        </button>
                    </Link>
                    <Link href='#'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <AiOutlineTags /> {t('License Types')}
                        </button>
                    </Link>
                    <Link href='#'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <AiOutlineUnorderedList /> {t('Obligations')}
                        </button>
                    </Link>
                    <Link href='#'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <RxCalendar /> {t('Schedule')}
                        </button>
                    </Link>
                    <Link href='#'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <svg className='fossology_icon mb-1' height={18} width={18}>
                                <use href='icons.svg#fossology'></use>
                            </svg>{' '}
                            {t('Fossology')}
                        </button>
                    </Link>
                    <Link href='#'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <RiArrowUpDownFill /> {t('Import Export')}
                        </button>
                    </Link>
                    <Link href='/admin/databaseSanitation'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <BsSearch /> {t('Database Sanitation')}
                        </button>
                    </Link>
                    <Link href='#'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <BsFilter /> {t('Attachment Cleanup')}
                        </button>
                    </Link>
                    <Link href='/admin/oauthclient'>
                        <button type='button' className='btn btn-secondary mb-2 mx-2' style={{ width: '210px' }}>
                            <HiOutlineDocumentDuplicate /> {t('OAuth Client')}
                        </button>
                    </Link>
                </div>
            </div>
        </>
    )
}

export default AdminMainPage
