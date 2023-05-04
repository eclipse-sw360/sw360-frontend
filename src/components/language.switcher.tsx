// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { VN, GB, JP, CN } from 'country-flag-icons/react/3x2'
import Link from 'next/link'
import { useCookies } from 'react-cookie'

const LanguageSwitcher = () => {
  const [ cookie, setCookie ] = useCookies(['NEXT_LOCALE']);
  
  const switchLanguage = (loc: string) => {
    if(cookie.NEXT_LOCALE !== loc){
      setCookie('NEXT_LOCALE', loc, { path: '/' });
    }
  }

  return (
    <>
      <Link href='/' locale='en' title='Great Britain' onClick={() => switchLanguage('en')}><GB title='English' className='flags'/></Link>
      <Link href='/' locale='ja' title='Japan' onClick={() => switchLanguage('ja')}><JP title='Japanese'className='flags'/></Link>
      <Link href='/' locale='vi' title='Vietnam' onClick={() => switchLanguage('vi')}><VN title='Vietnamese'className='flags'/></Link>
      <Link href='/' locale='zh' title='China' onClick={() => switchLanguage('zh')}><CN title='Chinese' className='flags'/></Link>
    </>
  )
}

export default LanguageSwitcher
