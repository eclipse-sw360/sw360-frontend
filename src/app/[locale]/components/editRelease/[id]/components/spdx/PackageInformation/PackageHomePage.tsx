// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

interface Props {
    setPackageHomePageToPackage?: (data: string) => void
    packageHomePageExist?: boolean
    setPackageHomePageExist?: React.Dispatch<React.SetStateAction<boolean>>
    packageHomePageNone?: boolean
    setPackageHomePageNone?: React.Dispatch<React.SetStateAction<boolean>>
    packageHomePageNoasserttion?: boolean
    setPackageHomePageNoasserttion?: React.Dispatch<React.SetStateAction<boolean>>
    packageHomePage?: string
}

function PackageHomePage({
    setPackageHomePageToPackage,
    packageHomePageExist,
    setPackageHomePageExist,
    packageHomePageNone,
    setPackageHomePageNone,
    packageHomePageNoasserttion,
    setPackageHomePageNoasserttion,
    packageHomePage,
}: Props) {
    const selectPackageHomePageExist = () => {
        setPackageHomePageExist(true)
        setPackageHomePageNone(false)
        setPackageHomePageNoasserttion(false)
        setPackageHomePageToPackage(packageHomePage)
    }
    const selectPackageHomePageNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPackageHomePageExist(false)
        setPackageHomePageNone(true)
        setPackageHomePageNoasserttion(false)
        setPackageHomePageToPackage(e.target.value)
    }
    const selectPackageHomePageNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPackageHomePageExist(false)
        setPackageHomePageNone(false)
        setPackageHomePageNoasserttion(true)
        setPackageHomePageToPackage(e.target.value)
    }

    const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPackageHomePageToPackage(e.target.value)
    }

    return (
        <td colSpan={3}>
            <div className='form-group'>
                <label className='lableSPDX'>7.11 Package home page</label>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ display: 'inline-flex', flex: 3, marginRight: '1rem' }}>
                        <input
                            className='spdx-radio'
                            id='packageHomepageExist'
                            type='radio'
                            name='_sw360_portlet_components_PACKAGE_HOMEPAGE'
                            value='EXIST'
                            onClick={selectPackageHomePageExist}
                            checked={packageHomePageExist}
                        />
                        <input
                            style={{ flex: 6, marginRight: '1rem' }}
                            id='packageHomePage'
                            className='form-control'
                            type='text'
                            name='homepage'
                            placeholder='Enter package homepage'
                            onChange={updateField}
                            value={packageHomePage ?? ''}
                            disabled={packageHomePageNone || packageHomePageNoasserttion}
                        />
                    </div>
                    <div style={{ flex: 2 }}>
                        <input
                            className='spdx-radio'
                            id='packageHomepageNone'
                            type='radio'
                            name='homepage'
                            value='NONE'
                            onChange={selectPackageHomePageNone}
                            checked={packageHomePageNone}
                        />
                        <label
                            style={{ marginRight: '2rem' }}
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='packageHomePageNone'
                        >
                            NONE
                        </label>
                        <input
                            className='spdx-radio'
                            id='packageHomepageNoAssertion'
                            type='radio'
                            name='homepage'
                            value='NOASSERTION'
                            onChange={selectPackageHomePageNoasserttion}
                            checked={packageHomePageNoasserttion}
                        />
                        <label className='form-check-label radio-label lableSPDX' htmlFor='packageHomePageNoAssertion'>
                            NOASSERTION
                        </label>
                    </div>
                </div>
            </div>
        </td>
    )
}

export default PackageHomePage
