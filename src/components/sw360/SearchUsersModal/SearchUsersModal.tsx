// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'

import type { JSX } from "react";

function SearchUsersModal(): JSX.Element {
    const t = useTranslations('default')
    return (
        <>
            <div
                className='modal fade'
                id='search_users_modal'
                tabIndex={-1}
                aria-labelledby='Search Users Modal'
                aria-hidden='true'
            >
                <div className='modal-dialog modal-lg modal-dialog-centered'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title fw-bold' id='search_users_modal_label'>
                                {t('Search Users')}
                            </h5>
                            <button
                                type='button'
                                className='btn-close'
                                data-bs-dismiss='modal'
                                aria-label='Close'
                            ></button>
                        </div>
                        <div className='modal-body'>
                            <div className='row'>
                                <div className='col-lg-6'>
                                    <input
                                        type='text'
                                        className='form-control'
                                        placeholder={t('Enter search text')}
                                        aria-describedby={t('Search Users')}
                                    />
                                </div>
                                <div className='col-lg-4'>
                                    <button type='button' className='btn btn-secondary me-2'>
                                        {t('Search')}
                                    </button>
                                    <button type='button' className='btn btn-secondary'>
                                        {t('Reset')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' data-bs-dismiss='modal' className='btn btn-secondary me-2'>
                                {t('Close')}
                            </button>
                            <button type='button' className='btn btn-primary'>
                                {t('Select Users')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SearchUsersModal
