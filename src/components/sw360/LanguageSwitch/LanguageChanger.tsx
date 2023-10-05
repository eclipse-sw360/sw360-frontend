// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { usePathname, useRouter } from 'next-intl/client'

interface Props {
    locale: string
}

function LanguageSwitch({ locale }: Props) {
    const router = useRouter()
    const pathname = usePathname()

    const handleChange = (e: { target: { value: string } }) => {
        router.push(pathname, { locale: e.target.value })
    }

    return (
        <select value={locale} onChange={handleChange}>
            <option value='en'>English</option>
            <option value='vi'>Vietnamese</option>
            <option value='zh'>Chinese</option>
            <option value='ja'>日本語</option>
        </select>
    )
}

export default LanguageSwitch
