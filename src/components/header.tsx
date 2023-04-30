// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react';
import Image from 'next/image'
import Link from 'next/link';
import Sw360Logo from '@/assets/images/sw360-logo.svg';
import { signOut, useSession } from 'next-auth/react';

const PageHeader = () => {
    const { data: session } = useSession();

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
                            <Link href='#' onClick={() => signOut({
                                callbackUrl: '/auth'
                            })}>Logout</Link>
                        </div>
                    </div>
                ) : <></>}
            </div>
        </div>
    )
}

export default PageHeader