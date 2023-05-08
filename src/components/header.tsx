// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react';
import Image from 'next/image'
import Link from 'next/link';
import Sw360Logo from '@/assets/images/sw360-logo.svg';
import { signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next'

const PageHeader = () => {
    const { data: session } = useSession();
    const { t } = useTranslation("common");

    return (
        <div className='header'>
            <div className='row'>
                <div className='col-3'>
                    <Link className='logo custom-logo' href='/' title='Go to SW360'>
                        <Image height='56' src={Sw360Logo} alt='...' />
                    </Link>
                </div>
                {session ? (
                    <div className='col'>
                        <div className='text-end'>
                            <Link href='' onClick={() => signOut({
                                callbackUrl: '/'
                            })}>{t('Logout')}</Link>
                        </div>
                    </div>
                ) : <></>}
            </div>
        </div>
    )
}

export default PageHeader