// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useSession } from 'next-auth/react'
import Link from 'next-intl/link'
import Image from 'next/image'
import React, { useState } from 'react'

import searchLogo from '@/assets/icons/search.svg'
import sw360logo from '@/assets/images/sw360-logo.svg'
import { LocaleSwitcher, Navbar, ProfileDropdown } from 'next-sw360'

const Header = () => {
    const { data: session } = useSession()
    const [inputValue, setInputValue] = useState('')

    const initiateSearch = () => {
        console.log('Search button is clicked !', inputValue)
    }

    const getSearchedKeyword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value)
    }

    return (
        <div>
            <div className='container-fluid pt-2 pb-2'>
                <div className='row'>
                    <div className='col-md-4'>
                        <Link href='/' className='logo'>
                            <Image src={sw360logo} height={57} width={147} alt='SW360 Logo' />
                        </Link>
                    </div>
                    <div className='col-md-5 col-md-offset-1'></div>
                    {session && (
                        <div className='col-md-2 pt-2'>
                            <form className='d-flex input-group w-auto'>
                                <input
                                    type='text'
                                    className='form-control rounded'
                                    placeholder='Search...'
                                    value={inputValue}
                                    onChange={getSearchedKeyword}
                                />
                                <button
                                    className='input-group-text text-white border-0'
                                    type='submit'
                                    id='search-addon'
                                    onClick={initiateSearch}
                                >
                                    <Image src={searchLogo} alt='Search Icon' />
                                </button>
                            </form>
                        </div>
                    )}

                    {session && (
                        <div className='col-md-1 pt-1' style={{ float: 'left' }}>
                            <div>
                                <ProfileDropdown />
                            </div>
                            <div>
                                <LocaleSwitcher />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className='row'>
                <Navbar />
            </div>
        </div>
    )
}

export default Header
