// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// import { BR, CN, GB, JP, VN } from 'country-flag-icons/react/3x2'
import { LOCALES } from '@/constants'
import Link from 'next/link'

function LanguageSwitcher() {
    return (
        <>
            {LOCALES.map((locale) => (
                <Link href='/' locale={locale.i18n} key={locale.i18n}>
                    <span className={`fi fi-${locale.flag} flag`} />
                </Link>
            ))}
        </>
    )
}

export default LanguageSwitcher
