// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { VN, GB, JP, CN } from 'country-flag-icons/react/3x2'
import Link from 'next-intl/link'

const LanguageSwitcher = () => {
  return (
    <>
      <Link href='/' locale='en' title='Great Britain'><GB title='English' className='flags'/></Link>
      <Link href='/' locale='ja' title='Japan'><JP title='Japanese'className='flags'/></Link>
      <Link href='/' locale='vi' title='Vietnam'><VN title='Vietnamese'className='flags'/></Link>
      <Link href='/' locale='zh' title='China'><CN title='Chinese' className='flags'/></Link>
    </>
  )
}

export default LanguageSwitcher
