// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'
import { getData } from 'country-list'
import { useTranslations } from 'next-intl';
import { COMMON_NAMESPACE } from '@/object-types/Constants';

interface Props {
    selectCountry?: React.ChangeEventHandler<HTMLSelectElement>
    value?: string
}

export default function SelectCountryComponent(props: Props) {
    const t = useTranslations(COMMON_NAMESPACE);
    return (
        <>
            <label htmlFor='country' className='form-label fw-bold'>
                {t('Owner Country')}
            </label>
            <select
                className='form-select'
                aria-label='country'
                id='country'
                defaultValue=''
                name='ownerCountry'
                onChange={props.selectCountry}
            >
                <option value=''>{t('Select a country')}</option>
                {getData().map((country: any) => (
                    <option key={country.code} value={country.name}>
                        {country.name}
                    </option>
                ))}
            </select>
        </>
    )
}
