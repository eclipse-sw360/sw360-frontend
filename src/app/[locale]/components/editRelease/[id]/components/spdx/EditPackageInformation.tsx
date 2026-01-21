// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { signOut, useSession } from 'next-auth/react'
import { ChangeEvent, ReactNode, useEffect, useState } from 'react'
import { BsFillTrashFill } from 'react-icons/bs'
import {
    CheckSum,
    ExternalReference,
    InputKeyValue,
    PackageInformation,
    PackageVerificationCode,
    SPDX,
} from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import BuiltDate from './PackageInformation/BuiltDate'
import CheckSums from './PackageInformation/CheckSums'
import PackageOriginator from './PackageInformation/PackageOriginator'
import PackageSupplier from './PackageInformation/PackageSupplier'
import ReleaseDate from './PackageInformation/ReleaseDate'
import ValidUntilDate from './PackageInformation/ValidUntilDate'

interface Props {
    packageInformation: PackageInformation
    setPackageInformation: React.Dispatch<React.SetStateAction<PackageInformation>>
    isModeFull: boolean
    externalRefsDatas: ExternalReference[]
    setExternalRefsDatas: React.Dispatch<React.SetStateAction<ExternalReference[]>>
    setIndexExternalRefsData: React.Dispatch<React.SetStateAction<number>>
    indexExternalRefsData: number
    setTypeCategory: React.Dispatch<React.SetStateAction<Array<string>>>
    typeCategory: Array<string>
    isTypeCateGoryEmpty: boolean
    setIsTypeCateGoryEmpty: React.Dispatch<React.SetStateAction<boolean>>
    SPDXPayload: SPDX
    setSPDXPayload: React.Dispatch<React.SetStateAction<SPDX>>
}

const EditPackageInformation = ({
    packageInformation,
    isModeFull,
    externalRefsDatas,
    setExternalRefsDatas,
    setPackageInformation,
    indexExternalRefsData,
    setIndexExternalRefsData,
    typeCategory,
    setTypeCategory,
    isTypeCateGoryEmpty,
    setIsTypeCateGoryEmpty,
    SPDXPayload,
    setSPDXPayload,
}: Props): ReactNode => {
    const [toggle, setToggle] = useState(false)
    const [dataPackageSupplier, setDataPackageSupplier] = useState<InputKeyValue>({
        key: '',
        value: '',
    })
    const [isPackageSupplier, setIsPackageSupplier] = useState(true)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const handlePackageSupplier = (data: string) => {
        if (data === 'NOASSERTION') {
            const input: InputKeyValue = {
                key: dataPackageSupplier.key,
                value: dataPackageSupplier.value,
            }
            return input
        }
        const input: InputKeyValue = {
            key: data.split(':')[0],
            value: data.split(':')[1],
        }
        return input
    }

    const handleInputKeyToPackageSupplier = (data: InputKeyValue) => {
        return data.value === 'NOASSERTION' ? 'NOASSERTION' : data.key + ':' + data.value
    }

    const setPackageSupplierToPackage = (input: InputKeyValue) => {
        setPackageInformation({
            ...packageInformation,
            supplier: handleInputKeyToPackageSupplier(input),
        } as PackageInformation)

        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                supplier: handleInputKeyToPackageSupplier(input),
            } as PackageInformation,
        })
    }

    const [dataPackageOriginator, setDataPackageOriginator] = useState<InputKeyValue>({
        key: '',
        value: '',
    })
    const [isPackageOriginator, setIsPackageOriginator] = useState(true)

    const handlePackageOriginator = (data: string) => {
        if (data === 'NOASSERTION') {
            const input: InputKeyValue = {
                key: dataPackageOriginator.key,
                value: dataPackageOriginator.value,
            }
            return input
        }
        const input: InputKeyValue = {
            key: data.split(':')[0],
            value: data.split(':')[1],
        }
        return input
    }

    const handleInputKeyToPackageOriginator = (data: InputKeyValue) => {
        return data.value === 'NOASSERTION' ? 'NOASSERTION' : data.key + ':' + data.value
    }

    const setPackageOriginatorToPackage = (input: InputKeyValue) => {
        setPackageInformation({
            ...packageInformation,
            originator: handleInputKeyToPackageOriginator(input),
        } as PackageInformation)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                originator: handleInputKeyToPackageOriginator(input),
            } as PackageInformation,
        })
    }

    const [checkSums, setCheckSums] = useState<InputKeyValue[]>([])

    const setDataCheckSums = (inputs: InputKeyValue[]) => {
        setPackageInformation({
            ...packageInformation,
            checksums: convertInputToChecksums(inputs),
        } as PackageInformation)

        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                checksums: convertInputToChecksums(inputs),
            } as PackageInformation,
        })
    }

    const convertInputToChecksums = (datas: InputKeyValue[] | null) => {
        if (datas === null) {
            return null
        }
        const checksums: CheckSum[] = []
        datas.forEach((data: InputKeyValue, index: number) => {
            const checksum: CheckSum = {
                algorithm: data.key,
                checksumValue: data.value,
                index: index,
            }
            checksums.push(checksum)
        })

        return checksums
    }

    const handleChangeReferenceCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const referenceCategory: string = e.target.value
        let type = ''
        if (referenceCategory === 'SECURITY') {
            type = 'cpe22Type'
            setTypeCategory([
                'cpe22Type',
                'cpe23Type',
                'advisory',
                'fix',
                'url',
                'swid',
            ])
            setIsTypeCateGoryEmpty(false)
        } else if (referenceCategory === 'PACKAGE-MANAGER') {
            setTypeCategory([
                'maven-central',
                'npm',
                'nuget',
                'bower',
                'purl',
            ])
            setIsTypeCateGoryEmpty(false)
            type = 'maven-central'
        } else {
            setTypeCategory([])
            setIsTypeCateGoryEmpty(true)
        }
        const externalRefs: ExternalReference[] = externalRefsDatas.map((externalRefData, index) => {
            if (index === indexExternalRefsData) {
                return {
                    ...externalRefData,
                    [e.target.name]: e.target.value,
                    referenceType: type,
                }
            }
            return externalRefData
        })
        setExternalRefsDatas(externalRefs)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                externalRefs: externalRefs,
            } as PackageInformation,
        })
    }

    const handleChangeExternalRefData = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const externalRefs: ExternalReference[] = externalRefsDatas.map((externalRefData, index) => {
            if (index === indexExternalRefsData) {
                return {
                    ...externalRefData,
                    [e.target.name]: e.target.value,
                }
            }
            return externalRefData
        })
        setExternalRefsDatas(externalRefs)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                externalRefs: externalRefs,
            } as PackageInformation,
        })
    }
    const [increIndex, setIncreIndex] = useState(0)
    const [isAdd, setIsAdd] = useState(false)

    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index: string = e.target.value
        if (parseInt(index) === increIndex) {
            setIsAdd(true)
        } else {
            setIncreIndex(parseInt(index))
        }
        setIndexExternalRefsData(parseInt(index))
        setNumberIndex(parseInt(index))
        if (externalRefsDatas[parseInt(index)].referenceCategory === 'SECURITY') {
            setTypeCategory([
                'cpe22Type',
                'cpe23Type',
                'advisory',
                'fix',
                'url',
                'swid',
            ])
            setIsTypeCateGoryEmpty(false)
        } else if (externalRefsDatas[parseInt(index)].referenceCategory === 'PACKAGE-MANAGER') {
            setTypeCategory([
                'maven-central',
                'npm',
                'nuget',
                'bower',
                'purl',
            ])
            setIsTypeCateGoryEmpty(false)
        } else {
            setIsTypeCateGoryEmpty(true)
        }
        console.log(isTypeCateGoryEmpty)
    }

    const addReferences = () => {
        const arrayExternals: ExternalReference[] = [
            ...externalRefsDatas,
        ]
        setIncreIndex(externalRefsDatas.length)
        setNumberIndex(externalRefsDatas.length)
        setIsAdd(true)
        const externalReference: ExternalReference = {
            referenceCategory: 'SECURITY',
            referenceLocator: '',
            referenceType: 'cpe22Type',
            comment: '',
            index: externalRefsDatas.length,
        }
        setIndexExternalRefsData(externalRefsDatas.length)
        arrayExternals.push(externalReference)
        setExternalRefsDatas(arrayExternals)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                externalRefs: arrayExternals,
            } as PackageInformation,
        })
    }

    const [packageDownloadLocation, setPackageDownloadLocation] = useState('')
    const [packageDownloadLocationExist, setPackageDownloadLocationExist] = useState(true)
    const [packageDownloadLocationNone, setPackageDownloadLocationNone] = useState(false)
    const [packageDownloadLocationNoasserttion, setPackageDownloadLocationNoasserttion] = useState(false)

    const setPackageDownloadLocationToPackage = (data: string) => {
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                downloadLocation: data,
            } as PackageInformation,
        })
    }

    const [packageHomePage, setPackageHomePage] = useState('')
    const [packageHomePageExist, setPackageHomePageExist] = useState(true)
    const [packageHomePageNone, setPackageHomePageNone] = useState(false)
    const [packageHomePageNoasserttion, setPackageHomePageNoasserttion] = useState(false)

    const setPackageHomePageToPackage = (data: string) => {
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                homepage: data,
            } as PackageInformation,
        })
    }

    const [concludedLicense, setConcludedLicense] = useState('')
    const [concludedLicenseExist, setConcludedLicenseExist] = useState(true)
    const [concludedLicenseNone, setConcludedLicenseNone] = useState(false)
    const [concludedLicenseNoasserttion, setConcludedLicenseNoasserttion] = useState(false)

    const setConcludedLicenseToPackage = (data: string) => {
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                licenseConcluded: data,
            } as PackageInformation,
        })
    }

    const [allLicensesInformation, setAllLicensesInformation] = useState<Array<string>>()
    const [allLicensesInformationExist, setAllLicensesInformationExist] = useState(true)
    const [allLicensesInformationNone, setAllLicensesInformationNone] = useState(false)
    const [allLicensesInformationNoasserttion, setAllLicensesInformationNoasserttion] = useState(false)

    const setAllLicensesInformationToPackage = (data: string[]) => {
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                licenseInfoFromFiles: data,
            } as PackageInformation,
        })
    }

    const [declaredLicense, setDeclaredLicense] = useState('')
    const [declaredLicenseExist, setDeclaredLicenseExist] = useState(true)
    const [declaredLicenseNone, setDeclaredLicenseNone] = useState(false)
    const [declaredLicenseNoasserttion, setDeclaredLicenseNoasserttion] = useState(false)

    const setDeclaredLicenseToPackage = (data: string) => {
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                licenseDeclared: data,
            } as PackageInformation,
        })
    }

    const [copyrightText, setCopyrightText] = useState('')
    const [copyrightTextExist, setCopyrightTextExist] = useState(true)
    const [copyrightTextNone, setCopyrightTextNone] = useState(false)
    const [copyrightTextNoasserttion, setCopyrightTextNoasserttion] = useState(false)

    const setCopyrightTextToPackage = (data: string) => {
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                copyrightText: data,
            } as PackageInformation,
        })
    }

    useEffect(() => {
        if (!CommonUtils.isNullEmptyOrUndefinedArray(packageInformation.checksums)) {
            setCheckSums(convertChecksums(packageInformation.checksums))
        }

        if (!CommonUtils.isNullEmptyOrUndefinedString(packageInformation.supplier)) {
            if (packageInformation.supplier == 'NOASSERTION') {
                setIsPackageSupplier(false)
            }
            setDataPackageSupplier(handlePackageSupplier(packageInformation.supplier))
        }

        if (!CommonUtils.isNullEmptyOrUndefinedString(packageInformation.originator)) {
            if (packageInformation.originator == 'NOASSERTION') {
                setIsPackageOriginator(false)
            }
            setDataPackageOriginator(handlePackageOriginator(packageInformation.originator))
        }

        if (!CommonUtils.isNullEmptyOrUndefinedString(externalRefsDatas[indexExternalRefsData]?.referenceCategory)) {
            if (externalRefsDatas[indexExternalRefsData].referenceCategory === 'SECURITY') {
                setTypeCategory([
                    'cpe22Type',
                    'cpe23Type',
                    'advisory',
                    'fix',
                    'url',
                    'swid',
                ])
                setIsTypeCateGoryEmpty(false)
            } else if (externalRefsDatas[indexExternalRefsData].referenceCategory === 'PACKAGE-MANAGER') {
                setTypeCategory([
                    'maven-central',
                    'npm',
                    'nuget',
                    'bower',
                    'purl',
                ])
                setIsTypeCateGoryEmpty(false)
            } else {
                setIsTypeCateGoryEmpty(true)
            }
        }

        if (!CommonUtils.isNullEmptyOrUndefinedString(packageInformation.downloadLocation)) {
            if (packageInformation.downloadLocation === 'NONE') {
                setPackageDownloadLocation('')
                setPackageDownloadLocationExist(false)
                setPackageDownloadLocationNone(true)
                setPackageDownloadLocationNoasserttion(false)
            } else if (packageInformation.downloadLocation === 'NOASSERTION') {
                setPackageDownloadLocation('')
                setPackageDownloadLocationExist(false)
                setPackageDownloadLocationNone(false)
                setPackageDownloadLocationNoasserttion(true)
            } else {
                setPackageDownloadLocation(packageInformation.downloadLocation)
            }
        }

        if (!CommonUtils.isNullEmptyOrUndefinedString(packageInformation.homepage)) {
            if (packageInformation.homepage === 'NONE') {
                setPackageHomePage('')
                setPackageHomePageExist(false)
                setPackageHomePageNone(true)
                setPackageHomePageNoasserttion(false)
            } else if (packageInformation.homepage === 'NOASSERTION') {
                setPackageHomePage('')
                setPackageHomePageExist(false)
                setPackageHomePageNone(false)
                setPackageHomePageNoasserttion(true)
            } else {
                setPackageHomePage(packageInformation.homepage)
            }
        }

        if (!CommonUtils.isNullEmptyOrUndefinedString(packageInformation.licenseConcluded)) {
            if (packageInformation.licenseConcluded === 'NONE') {
                setConcludedLicense('')
                setConcludedLicenseExist(false)
                setConcludedLicenseNone(true)
                setConcludedLicenseNoasserttion(false)
            } else if (packageInformation.licenseConcluded === 'NOASSERTION') {
                setConcludedLicense('')
                setConcludedLicenseExist(false)
                setConcludedLicenseNone(false)
                setConcludedLicenseNoasserttion(true)
            } else {
                setConcludedLicense(packageInformation.licenseConcluded)
            }
        }

        if (!CommonUtils.isNullEmptyOrUndefinedString(packageInformation.licenseDeclared)) {
            if (packageInformation.licenseDeclared === 'NONE') {
                setDeclaredLicense('')
                setDeclaredLicenseExist(false)
                setDeclaredLicenseNone(true)
                setDeclaredLicenseNoasserttion(false)
            } else if (packageInformation.licenseDeclared === 'NOASSERTION') {
                setDeclaredLicense('')
                setDeclaredLicenseExist(false)
                setDeclaredLicenseNone(false)
                setDeclaredLicenseNoasserttion(true)
            } else {
                setDeclaredLicense(packageInformation.licenseDeclared)
            }
        }

        if (!CommonUtils.isNullEmptyOrUndefinedString(packageInformation.copyrightText)) {
            if (packageInformation.copyrightText === 'NONE') {
                setCopyrightText('')
                setCopyrightTextExist(false)
                setCopyrightTextNone(true)
                setCopyrightTextNoasserttion(false)
            } else if (packageInformation.copyrightText === 'NOASSERTION') {
                setCopyrightText('')
                setCopyrightTextExist(false)
                setCopyrightTextNone(false)
                setCopyrightTextNoasserttion(true)
            } else {
                setCopyrightText(packageInformation.copyrightText)
            }
        }

        if (!CommonUtils.isNullEmptyOrUndefinedArray(packageInformation.licenseInfoFromFiles)) {
            if (packageInformation.licenseInfoFromFiles.toString() === 'NONE') {
                setAllLicensesInformation([])
                setAllLicensesInformationExist(false)
                setAllLicensesInformationNone(true)
                setAllLicensesInformationNoasserttion(false)
            } else if (packageInformation.licenseInfoFromFiles.toString() === 'NOASSERTION') {
                console.log(allLicensesInformation)
                setAllLicensesInformation([])
                setAllLicensesInformationExist(false)
                setAllLicensesInformationNone(false)
                setAllLicensesInformationNoasserttion(true)
            } else {
                setAllLicensesInformation(packageInformation.licenseInfoFromFiles)
            }
        }

        if (!CommonUtils.isNullEmptyOrUndefinedString(packageInformation.releaseDate)) {
            setDataReleaseDate(handleDate(packageInformation.releaseDate))
        }
        if (!CommonUtils.isNullEmptyOrUndefinedString(packageInformation.builtDate)) {
            setDataBuiltDate(handleDate(packageInformation.builtDate))
        }
        if (!CommonUtils.isNullEmptyOrUndefinedString(packageInformation.validUntilDate)) {
            setDataValidUntilDate(handleDate(packageInformation.validUntilDate))
        }
    }, [
        packageInformation.builtDate,
        packageInformation.validUntilDate,
        packageInformation.releaseDate,
        packageInformation.downloadLocation,
        packageInformation.homepage,
        packageInformation.licenseConcluded,
        packageInformation.licenseDeclared,
        packageInformation.copyrightText,
        packageInformation.licenseInfoFromFiles,
    ])

    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setPackageInformation({
            ...packageInformation,
            [e.target.name]: e.target.value,
        } as PackageInformation)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                [e.target.name]: e.target.value,
            } as PackageInformation,
        })
    }

    const updateFieldLicenseAllFile = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setPackageInformation({
            ...packageInformation,
            [e.target.name]: e.target.value,
        } as PackageInformation)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                [e.target.name]: e.target.value.split('\n'),
            } as PackageInformation,
        })
    }

    const updateFieldCopyright = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setPackageInformation({
            ...packageInformation,
            [e.target.name]: e.target.value,
        } as PackageInformation)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                [e.target.name]: e.target.value,
            } as PackageInformation,
        })
    }

    const updateFieldAttributionText = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setPackageInformation({
            ...packageInformation,
            [e.target.name]: e.target.value,
        } as PackageInformation)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                [e.target.name]: e.target.name === 'attributionText' ? e.target.value.split('\n') : e.target.value,
            } as PackageInformation,
        })
    }

    const updateFieldSPDXIdentifier = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPackageInformation({
            ...packageInformation,
            [e.target.name]: e.target.value,
        } as PackageInformation)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                [e.target.name]: 'SPDXRef-' + e.target.value,
            } as PackageInformation,
        })
    }

    const updateFieldPackageVerificationCode = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPackageInformation({
            ...packageInformation,
            packageVerificationCode: {
                ...packageInformation.packageVerificationCode,
                [e.target.name]: e.target.value,
            },
        } as PackageInformation)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                packageVerificationCode: {
                    ...packageInformation.packageVerificationCode,
                    [e.target.name]: e.target.value,
                },
            } as PackageInformation,
        })
    }

    const updateFieldExcludedFiles = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setPackageInformation({
            ...packageInformation,
            packageVerificationCode: {
                ...packageInformation.packageVerificationCode,
                [e.target.name]: e.target.value.split('\n'),
            },
        } as PackageInformation)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                packageVerificationCode: {
                    ...packageInformation.packageVerificationCode,
                    [e.target.name]: e.target.value.split('\n'),
                },
            } as PackageInformation,
        })
    }

    const convertChecksums = (checksums: CheckSum[]) => {
        const inputs: InputKeyValue[] = []
        checksums.forEach((checksum: CheckSum) => {
            const input: InputKeyValue = {
                key: checksum.algorithm,
                value: checksum.checksumValue,
            }
            inputs.push(input)
        })
        return inputs
    }

    const [dataReleaseDate, setDataReleaseDate] = useState<InputKeyValue | undefined>(undefined)
    const [dataBuiltDate, setDataBuiltDate] = useState<InputKeyValue | undefined>(undefined)
    const [dataValidUntilDate, setDataValidUntilDate] = useState<InputKeyValue>()
    const handleDate = (data: string) => {
        const input: InputKeyValue = {
            key: CommonUtils.fillDate(data),
            value: CommonUtils.fillTime(data),
        }
        return input
    }

    const convertInputToDate = (data: InputKeyValue) => {
        if (data.key == '' || data.value == '') {
            return ''
        }
        const localDate = new Date(data.key + ' ' + data.value)
        if (isNaN(+localDate)) return
        return localDate.toISOString().slice(0, -5) + 'Z'
    }

    const setBuiltDate = (inputs: InputKeyValue) => {
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                builtDate: convertInputToDate(inputs) ?? '',
            } as PackageInformation,
        })
    }

    const setValidUntilDate = (inputs: InputKeyValue) => {
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                validUntilDate: convertInputToDate(inputs) ?? '',
            } as PackageInformation,
        })
    }

    const setReleaseDate = (inputs: InputKeyValue) => {
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                releaseDate: convertInputToDate(inputs) ?? '',
            } as PackageInformation,
        })
    }

    const changeFilesAnalyzed = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filesAnalyzed = !CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
            ? !packageInformation.filesAnalyzed
            : true
        setPackageInformation({
            ...packageInformation,
            filesAnalyzed: filesAnalyzed,
        } as PackageInformation)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                filesAnalyzed: filesAnalyzed,
            } as PackageInformation,
        })
        if (e.target.value === 'false') {
            const packageVerificationCode: PackageVerificationCode = {
                excludedFiles: [],
                value: '',
            }
            setSPDXPayload({
                ...SPDXPayload,
                packageInformation: {
                    ...SPDXPayload.packageInformation,
                    filesAnalyzed: false,
                    licenseInfoFromFiles: [],
                    packageVerificationCode: packageVerificationCode,
                } as PackageInformation,
            })
        } else {
            setSPDXPayload({
                ...SPDXPayload,
                packageInformation: {
                    ...SPDXPayload.packageInformation,
                    filesAnalyzed: true,
                    licenseInfoFromFiles: allLicensesInformation ?? [],
                    packageVerificationCode: packageInformation.packageVerificationCode,
                } as PackageInformation,
            })
        }
    }

    const [numberIndex, setNumberIndex] = useState<number>(0)
    const [isDeleteSucces, setIsDeleteSucces] = useState(false)

    const deleteExternalRefsDatas = () => {
        if (externalRefsDatas.length == 1) {
            setExternalRefsDatas([])
        } else {
            let externalRefs: ExternalReference[] = []
            externalRefs = externalRefsDatas.filter((externalRefsData) => numberIndex != externalRefsData.index)
            setNumberIndex(indexExternalRefsData)
            for (let index = 0; index < externalRefs.length; index++) {
                externalRefs[index].index = index
            }
            setExternalRefsDatas(externalRefs)
            setIndexExternalRefsData(0)
            setIsDeleteSucces(true)
            setSPDXPayload({
                ...SPDXPayload,
                packageInformation: {
                    ...SPDXPayload.packageInformation,
                    externalRefs: externalRefs,
                } as PackageInformation,
            })
            if (!CommonUtils.isNullEmptyOrUndefinedArray(externalRefs)) {
                setNumberIndex(externalRefs[0].index)
            }
        }
    }

    const selectCopyrightTextExist = () => {
        setCopyrightTextExist(true)
        setCopyrightTextNone(false)
        setCopyrightTextNoasserttion(false)
        setCopyrightTextToPackage(copyrightText)
    }
    const selectCopyrightTextNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCopyrightTextExist(false)
        setCopyrightTextNone(true)
        setCopyrightTextNoasserttion(false)
        setCopyrightTextToPackage(e.target.value)
    }
    const selectCopyrightTextNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCopyrightTextExist(false)
        setCopyrightTextNone(false)
        setCopyrightTextNoasserttion(true)
        setCopyrightTextToPackage(e.target.value)
    }

    const selectAllLicensesInformationExist = () => {
        setAllLicensesInformationExist(true)
        setAllLicensesInformationNone(false)
        setAllLicensesInformationNoasserttion(false)
        setAllLicensesInformationToPackage(allLicensesInformation ?? [])
    }
    const selectAllLicensesInformationNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAllLicensesInformationExist(false)
        setAllLicensesInformationNone(true)
        setAllLicensesInformationNoasserttion(false)
        setAllLicensesInformationToPackage(e.target.value.split('\n'))
    }
    const selectAllLicensesInformationNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAllLicensesInformationExist(false)
        setAllLicensesInformationNone(false)
        setAllLicensesInformationNoasserttion(true)
        setAllLicensesInformationToPackage(e.target.value.split('\n'))
    }

    const isNotNoneOrNoasserttion = (obj: string[]) => {
        if (obj.toString() === 'NONE' || obj.toString() === 'NOASSERTION') {
            return false
        }
        return true
    }

    const isNotNoneOrNoasserttionString = (data: string) => {
        if (data === 'NONE' || data === 'NOASSERTION') {
            return false
        }
        return true
    }

    const selectPackageDownloadLocationExist = () => {
        setPackageDownloadLocationExist(true)
        setPackageDownloadLocationNone(false)
        setPackageDownloadLocationNoasserttion(false)
        setPackageDownloadLocationToPackage(packageDownloadLocation)
    }
    const selectPackageDownloadLocationNone = (e: ChangeEvent<HTMLInputElement>) => {
        setPackageDownloadLocationNone(true)
        setPackageDownloadLocationExist(false)
        setPackageDownloadLocationNoasserttion(false)
        setPackageDownloadLocationToPackage(e.target.value)
    }
    const selectPackageDownloadLocationNoasserttion = (e: ChangeEvent<HTMLInputElement>) => {
        setPackageDownloadLocationNoasserttion(true)
        setPackageDownloadLocationExist(false)
        setPackageDownloadLocationNone(false)
        setPackageDownloadLocationToPackage(e.target.value)
    }

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

    const selectConcludedLicenseExist = () => {
        setConcludedLicenseExist(true)
        setConcludedLicenseNone(false)
        setConcludedLicenseNoasserttion(false)
        setConcludedLicenseToPackage(concludedLicense)
    }
    const selectConcludedLicenseNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConcludedLicenseExist(false)
        setConcludedLicenseNone(true)
        setConcludedLicenseNoasserttion(false)
        setConcludedLicenseToPackage(e.target.value)
    }
    const selectConcludedLicenseNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConcludedLicenseExist(false)
        setConcludedLicenseNone(false)
        setConcludedLicenseNoasserttion(true)
        setConcludedLicenseToPackage(e.target.value)
    }

    const selectDeclaredLicenseExist = () => {
        setDeclaredLicenseExist(true)
        setDeclaredLicenseNone(false)
        setDeclaredLicenseNoasserttion(false)
        setDeclaredLicenseToPackage(declaredLicense)
    }
    const selectDeclaredLicenseNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeclaredLicenseExist(false)
        setDeclaredLicenseNone(true)
        setDeclaredLicenseNoasserttion(false)
        setDeclaredLicenseToPackage(e.target.value)
    }
    const selectDeclaredLicenseNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeclaredLicenseExist(false)
        setDeclaredLicenseNone(false)
        setDeclaredLicenseNoasserttion(true)
        setDeclaredLicenseToPackage(e.target.value)
    }

    return (
        <table className='table summary-table'>
            <thead
                title='Click to expand or collapse'
                onClick={() => {
                    setToggle(!toggle)
                }}
            >
                <tr>
                    <th colSpan={3}>7. Package Information</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <>
                    <tr>
                        <td>
                            <div className='form-group'>
                                <label
                                    className='lableSPDX'
                                    htmlFor='packageName'
                                >
                                    7.1 Package name
                                </label>
                                <div
                                    style={{
                                        display: 'flex',
                                    }}
                                >
                                    <input
                                        id='packageName'
                                        className='form-control needs-validation'
                                        name='name'
                                        type='text'
                                        placeholder='Enter package name'
                                        onChange={updateField}
                                        value={packageInformation.name ?? ''}
                                    />
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className='form-group'>
                                <label
                                    className='lableSPDX'
                                    htmlFor='packageSPDXId'
                                >
                                    7.2 Package SPDX identifier
                                </label>
                                <div
                                    style={{
                                        display: 'flex',
                                    }}
                                >
                                    <label className='sub-label'>SPDXRef-</label>
                                    <input
                                        id='packageSPDXId'
                                        className='form-control needs-validation'
                                        type='text'
                                        placeholder='Enter package SPDX identifier'
                                        name='SPDXID'
                                        defaultValue='value'
                                        onChange={updateFieldSPDXIdentifier}
                                        value={
                                            CommonUtils.isNullEmptyOrUndefinedString(packageInformation.SPDXID)
                                                ? 'Package-'
                                                : packageInformation.SPDXID.startsWith('SPDXRef-')
                                                  ? packageInformation.SPDXID.substring(8)
                                                  : packageInformation.SPDXID
                                        }
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <div className='form-group'>
                                <label
                                    className='lableSPDX'
                                    htmlFor='versionInfo'
                                >
                                    7.3 Package version
                                </label>
                                <div
                                    style={{
                                        display: 'flex',
                                    }}
                                >
                                    <input
                                        id='versionInfo'
                                        className='form-control'
                                        type='text'
                                        placeholder='Enter package version'
                                        name='versionInfo'
                                        onChange={updateField}
                                        value={packageInformation.versionInfo ?? ''}
                                    />
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className='form-group'>
                                <label
                                    className='lableSPDX'
                                    htmlFor='packageFileName'
                                >
                                    7.4 Package file name
                                </label>
                                <div
                                    style={{
                                        display: 'flex',
                                    }}
                                >
                                    <input
                                        id='packageFileName'
                                        className='form-control'
                                        type='text'
                                        placeholder='Enter package file name'
                                        name='packageFileName'
                                        onChange={updateField}
                                        value={packageInformation.packageFileName ?? ''}
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>

                    {isModeFull && (
                        <>
                            <tr className='spdx-full'>
                                <PackageSupplier
                                    dataPackageSupplier={dataPackageSupplier}
                                    setDataPackageSupplier={setDataPackageSupplier}
                                    setPackageSupplierToPackage={setPackageSupplierToPackage}
                                    isPackageSupplier={isPackageSupplier}
                                    setIsPackageSupplier={setIsPackageSupplier}
                                />
                            </tr>
                            <tr className='spdx-full'>
                                <PackageOriginator
                                    dataPackageOriginator={dataPackageOriginator}
                                    setDataPackageOriginator={setDataPackageOriginator}
                                    setPackageOriginatorToPackage={setPackageOriginatorToPackage}
                                    isPackageOriginator={isPackageOriginator}
                                    setIsPackageOriginator={setIsPackageOriginator}
                                />
                            </tr>
                        </>
                    )}
                    <tr>
                        <td colSpan={3}>
                            <div className='form-group'>
                                <label className='lableSPDX'>7.7 Package download location</label>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            flex: 3,
                                            marginRight: '1rem',
                                        }}
                                    >
                                        <input
                                            className='spdx-radio'
                                            type='radio'
                                            id='downloadLocationExist'
                                            name='_sw360_portlet_components_DOWNLOAD_LOCATION'
                                            value='EXIST'
                                            onChange={selectPackageDownloadLocationExist}
                                            checked={packageDownloadLocationExist}
                                        />
                                        <input
                                            style={{
                                                flex: 6,
                                                marginRight: '1rem',
                                            }}
                                            id='downloadLocation'
                                            className='form-control'
                                            type='text'
                                            name='downloadLocation'
                                            placeholder='Enter package download location'
                                            onChange={updateField}
                                            value={
                                                CommonUtils.isNullEmptyOrUndefinedString(
                                                    packageInformation.downloadLocation,
                                                )
                                                    ? ''
                                                    : isNotNoneOrNoasserttionString(packageInformation.downloadLocation)
                                                      ? packageInformation.downloadLocation
                                                      : ''
                                            }
                                            disabled={
                                                packageDownloadLocationNone || packageDownloadLocationNoasserttion
                                            }
                                        />
                                    </div>
                                    <div
                                        style={{
                                            flex: 2,
                                        }}
                                    >
                                        <input
                                            className='spdx-radio'
                                            id='downloadLocationNone'
                                            type='radio'
                                            name='downloadLocation'
                                            value='NONE'
                                            onChange={selectPackageDownloadLocationNone}
                                            checked={packageDownloadLocationNone}
                                        />
                                        <label
                                            style={{
                                                marginRight: '2rem',
                                            }}
                                            className='form-check-label radio-label lableSPDX'
                                            htmlFor='packageDownloadLocationNone'
                                        >
                                            NONE
                                        </label>
                                        <input
                                            className='spdx-radio'
                                            id='downloadLocationNoAssertion'
                                            type='radio'
                                            name='downloadLocation'
                                            value='NOASSERTION'
                                            onChange={selectPackageDownloadLocationNoasserttion}
                                            checked={packageDownloadLocationNoasserttion}
                                        />
                                        <label
                                            className='form-check-label radio-label lableSPDX'
                                            htmlFor='downloadLocationNoAssertion'
                                        >
                                            NOASSERTION
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={3}>
                            <div className='form-group'>
                                <label className='lableSPDX'>7.8 Files analyzed</label>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                    }}
                                >
                                    <div>
                                        <input
                                            className='spdx-radio'
                                            id='FilesAnalyzedTrue'
                                            type='radio'
                                            value='true'
                                            name='_sw360_portlet_components_FILES_ANALYZED'
                                            onChange={changeFilesAnalyzed}
                                            checked={
                                                !CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                                    ? packageInformation.filesAnalyzed
                                                    : false
                                            }
                                        />
                                        <label
                                            style={{
                                                marginRight: '2rem',
                                            }}
                                            className='form-check-label radio-label lableSPDX'
                                            htmlFor='FilesAnalyzedTrue'
                                        >
                                            TRUE
                                        </label>
                                        <input
                                            className='spdx-radio'
                                            id='FilesAnalyzedFalse'
                                            type='radio'
                                            name='_sw360_portlet_components_FILES_ANALYZED'
                                            value='false'
                                            onChange={changeFilesAnalyzed}
                                            checked={
                                                !CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                                    ? !packageInformation.filesAnalyzed
                                                    : true
                                            }
                                        />
                                        <label
                                            className='form-check-label radio-label lableSPDX'
                                            htmlFor='FilesAnalyzedFalse'
                                        >
                                            FALSE
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    {isModeFull && (
                        <>
                            <tr className='spdx-full'>
                                <td colSpan={3}>
                                    <div className='form-group'>
                                        <label
                                            className='lableSPDX'
                                            htmlFor='verificationCodeValue'
                                        >
                                            7.9 Package verification code
                                        </label>
                                        <div>
                                            <input
                                                style={{
                                                    marginBottom: '0.75rem',
                                                }}
                                                className='form-control'
                                                id='verificationCodeValue'
                                                name='value'
                                                placeholder='Enter verification code value'
                                                disabled={
                                                    !CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                                        ? !packageInformation.filesAnalyzed
                                                        : true
                                                }
                                                onChange={updateFieldPackageVerificationCode}
                                                value={packageInformation.packageVerificationCode?.value ?? ''}
                                            ></input>
                                            <textarea
                                                className='form-control'
                                                id='excludedFiles'
                                                rows={5}
                                                name='excludedFiles'
                                                placeholder='Enter excluded files'
                                                disabled={
                                                    !CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                                        ? !packageInformation.filesAnalyzed
                                                        : true
                                                }
                                                onChange={updateFieldExcludedFiles}
                                                value={
                                                    !CommonUtils.isNullOrUndefined(
                                                        packageInformation.packageVerificationCode,
                                                    ) &&
                                                    packageInformation.packageVerificationCode.excludedFiles !==
                                                        undefined
                                                        ? packageInformation.packageVerificationCode.excludedFiles
                                                              .toString()
                                                              .replaceAll(',', '\n')
                                                        : ''
                                                }
                                            ></textarea>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr className='spdx-full'>
                                <td colSpan={3}>
                                    <div className='form-group'>
                                        <label className='lableSPDX'>7.10 Package checksum</label>
                                        <div
                                            style={{
                                                display: 'flex',
                                            }}
                                        >
                                            <label className='sub-title lableSPDX'>Checksum</label>
                                            <CheckSums
                                                inputList={checkSums}
                                                setInputList={setCheckSums}
                                                setDataCheckSums={setDataCheckSums}
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </>
                    )}
                    <tr>
                        <td colSpan={3}>
                            <div className='form-group'>
                                <label className='lableSPDX'>7.11 Package home page</label>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            flex: 3,
                                            marginRight: '1rem',
                                        }}
                                    >
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
                                            style={{
                                                flex: 6,
                                                marginRight: '1rem',
                                            }}
                                            id='packageHomePage'
                                            className='form-control'
                                            type='text'
                                            name='homepage'
                                            placeholder='Enter package homepage'
                                            onChange={updateField}
                                            value={
                                                CommonUtils.isNullEmptyOrUndefinedString(packageInformation.homepage)
                                                    ? ''
                                                    : isNotNoneOrNoasserttionString(packageInformation.homepage)
                                                      ? packageInformation.homepage
                                                      : ''
                                            }
                                            disabled={packageHomePageNone || packageHomePageNoasserttion}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            flex: 2,
                                        }}
                                    >
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
                                            style={{
                                                marginRight: '2rem',
                                            }}
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
                                        <label
                                            className='form-check-label radio-label lableSPDX'
                                            htmlFor='packageHomePageNoAssertion'
                                        >
                                            NOASSERTION
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    {isModeFull && (
                        <tr className='spdx-full'>
                            <td colSpan={3}>
                                <div className='form-group'>
                                    <label
                                        className='lableSPDX'
                                        htmlFor='sourceInformation'
                                    >
                                        7.12 Source information
                                    </label>
                                    <div>
                                        <textarea
                                            className='form-control'
                                            id='sourceInformation'
                                            rows={5}
                                            name='sourceInfo'
                                            onChange={updateField}
                                            placeholder='Enter source information'
                                            value={packageInformation.sourceInfo ?? ''}
                                        ></textarea>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td colSpan={3}>
                            <div className='form-group'>
                                <label className='lableSPDX'>7.13 Concluded license</label>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            flex: 3,
                                            marginRight: '1rem',
                                        }}
                                    >
                                        <input
                                            className='spdx-radio'
                                            id='licenseConcludedExist'
                                            type='radio'
                                            name='licenseConcludedExist'
                                            value='EXIST'
                                            onClick={selectConcludedLicenseExist}
                                            checked={concludedLicenseExist}
                                        />
                                        <input
                                            style={{
                                                flex: 6,
                                                marginRight: '1rem',
                                            }}
                                            id='licenseConcluded'
                                            className='form-control'
                                            type='text'
                                            name='licenseConcluded'
                                            placeholder='Enter concluded license'
                                            onChange={updateField}
                                            value={
                                                CommonUtils.isNullEmptyOrUndefinedString(
                                                    packageInformation.licenseConcluded,
                                                )
                                                    ? ''
                                                    : isNotNoneOrNoasserttionString(packageInformation.licenseConcluded)
                                                      ? packageInformation.licenseConcluded
                                                      : ''
                                            }
                                            disabled={concludedLicenseNone || concludedLicenseNoasserttion}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            flex: 2,
                                        }}
                                    >
                                        <input
                                            className='spdx-radio'
                                            id='licenseConcludedNone'
                                            type='radio'
                                            name='licenseConcludedNone'
                                            value='NONE'
                                            onChange={selectConcludedLicenseNone}
                                            checked={concludedLicenseNone}
                                        />
                                        <label
                                            style={{
                                                marginRight: '2rem',
                                            }}
                                            className='form-check-label radio-label lableSPDX'
                                            htmlFor='licenseConcludedNone'
                                        >
                                            NONE
                                        </label>
                                        <input
                                            className='spdx-radio'
                                            id='licenseConcludedNoAssertion'
                                            type='radio'
                                            name='licenseConcludedNoAssertion'
                                            value='NOASSERTION'
                                            onChange={selectConcludedLicenseNoasserttion}
                                            checked={concludedLicenseNoasserttion}
                                        />
                                        <label
                                            className='form-check-label radio-label lableSPDX'
                                            htmlFor='licenseConcludedNoAssertion'
                                        >
                                            NOASSERTION
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    {isModeFull && (
                        <tr>
                            <td colSpan={3}>
                                <div className='form-group'>
                                    <label className='lableSPDX'>7.14 All licenses information from files</label>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'inline-flex',
                                                flex: 3,
                                                marginRight: '1rem',
                                            }}
                                        >
                                            <input
                                                className='spdx-radio'
                                                id='licenseInfoFromFilesExist'
                                                type='radio'
                                                name='licenseInfoFromFilesExist'
                                                value='EXIST'
                                                onClick={selectAllLicensesInformationExist}
                                                checked={allLicensesInformationExist}
                                                disabled={
                                                    !CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                                        ? !packageInformation.filesAnalyzed
                                                        : true
                                                }
                                            />
                                            <textarea
                                                style={{
                                                    flex: 6,
                                                    marginRight: '1rem',
                                                }}
                                                id='licenseInfoInFileValue'
                                                rows={5}
                                                className='form-control'
                                                name='licenseInfoFromFiles'
                                                placeholder='Enter all licenses information from files'
                                                onChange={updateFieldLicenseAllFile}
                                                value={
                                                    !packageInformation.licenseInfoFromFiles
                                                        ? ''
                                                        : isNotNoneOrNoasserttion(
                                                                packageInformation.licenseInfoFromFiles,
                                                            )
                                                          ? packageInformation.licenseInfoFromFiles
                                                                .toString()
                                                                .replaceAll(',', '\n')
                                                          : ''
                                                }
                                                disabled={
                                                    allLicensesInformationNone ||
                                                    allLicensesInformationNoasserttion ||
                                                    (!CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                                        ? !packageInformation.filesAnalyzed
                                                        : true)
                                                }
                                            ></textarea>
                                        </div>
                                        <div
                                            style={{
                                                flex: 2,
                                            }}
                                        >
                                            <input
                                                className='spdx-radio'
                                                id='licenseInfoInFileNone'
                                                type='radio'
                                                name='licenseInfoInFileNone'
                                                value='NONE'
                                                onChange={selectAllLicensesInformationNone}
                                                checked={allLicensesInformationNone}
                                                disabled={
                                                    !CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                                        ? !packageInformation.filesAnalyzed
                                                        : true
                                                }
                                            />
                                            <label
                                                style={{
                                                    marginRight: '2rem',
                                                }}
                                                className='form-check-label radio-label lableSPDX'
                                                htmlFor='licenseInfoInFileNone'
                                            >
                                                NONE
                                            </label>
                                            <input
                                                className='spdx-radio'
                                                id='licenseInfoFromFilesNoAssertion'
                                                type='radio'
                                                name='licenseInfoFromFilesNoAssertion'
                                                value='NOASSERTION'
                                                onChange={selectAllLicensesInformationNoasserttion}
                                                checked={allLicensesInformationNoasserttion}
                                                disabled={
                                                    !CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                                        ? !packageInformation.filesAnalyzed
                                                        : true
                                                }
                                            />
                                            <label
                                                className='form-check-label radio-label lableSPDX'
                                                htmlFor='licenseInfoFromFilesNoAssertion'
                                            >
                                                NOASSERTION
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td colSpan={3}>
                            <div className='form-group'>
                                <label className='lableSPDX'>7.15 Declared license</label>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            flex: 3,
                                            marginRight: '1rem',
                                        }}
                                    >
                                        <input
                                            className='spdx-radio'
                                            id='licenseDeclaredExist'
                                            type='radio'
                                            name='licenseDeclaredExist'
                                            value='EXIST'
                                            onClick={selectDeclaredLicenseExist}
                                            checked={declaredLicenseExist}
                                        />
                                        <input
                                            style={{
                                                flex: 6,
                                                marginRight: '1rem',
                                            }}
                                            id='licenseDeclared'
                                            className='form-control'
                                            type='text'
                                            name='licenseDeclared'
                                            placeholder='Enter declared license'
                                            onChange={updateField}
                                            value={
                                                CommonUtils.isNullEmptyOrUndefinedString(
                                                    packageInformation.licenseDeclared,
                                                )
                                                    ? ''
                                                    : isNotNoneOrNoasserttionString(packageInformation.licenseDeclared)
                                                      ? packageInformation.licenseDeclared
                                                      : ''
                                            }
                                            disabled={declaredLicenseNone || declaredLicenseNoasserttion}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            flex: 2,
                                        }}
                                    >
                                        <input
                                            className='spdx-radio'
                                            id='licenseDeclaredNone'
                                            type='radio'
                                            name='_sw360_portlet_components_DECLARED_LICENSE'
                                            value='NONE'
                                            onChange={selectDeclaredLicenseNone}
                                            checked={declaredLicenseNone}
                                        />
                                        <label
                                            style={{
                                                marginRight: '2rem',
                                            }}
                                            className='form-check-label radio-label lableSPDX'
                                            htmlFor='licenseDeclaredNone'
                                        >
                                            NONE
                                        </label>
                                        <input
                                            className='spdx-radio'
                                            id='licenseDeclaredNoAssertion'
                                            type='radio'
                                            name='licenseDeclaredNoAssertion'
                                            value='NOASSERTION'
                                            onChange={selectDeclaredLicenseNoasserttion}
                                            checked={declaredLicenseNoasserttion}
                                        />
                                        <label
                                            className='form-check-label radio-label lableSPDX'
                                            htmlFor='licenseDeclaredNoAssertion'
                                        >
                                            NOASSERTION
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr className='spdx-full'>
                        <td colSpan={3}>
                            <div className='form-group'>
                                <label
                                    className='lableSPDX'
                                    htmlFor='commentsOnLicense'
                                >
                                    7.16 Comments on license
                                </label>
                                <div>
                                    <textarea
                                        className='form-control'
                                        id='commentsOnLicense'
                                        rows={5}
                                        placeholder='Enter comments on license'
                                        name='licenseComments'
                                        onChange={updateField}
                                        value={packageInformation.licenseComments ?? ''}
                                    ></textarea>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={3}>
                            <div className='form-group'>
                                <label className='lableSPDX'>7.17 Copyright text</label>
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'inline-flex',
                                            flex: 3,
                                            marginRight: '1rem',
                                        }}
                                    >
                                        <input
                                            className='spdx-radio'
                                            id='copyrightTextExist'
                                            type='radio'
                                            name='_sw360_portlet_components_COPYRIGHT_TEXT'
                                            value='EXIST'
                                            onClick={selectCopyrightTextExist}
                                            checked={copyrightTextExist}
                                        />
                                        <textarea
                                            style={{
                                                flex: 6,
                                                marginRight: '1rem',
                                            }}
                                            id='copyrightText'
                                            rows={5}
                                            className='form-control'
                                            name='copyrightText'
                                            placeholder='Enter copyright text'
                                            onChange={updateFieldCopyright}
                                            value={
                                                CommonUtils.isNullEmptyOrUndefinedString(
                                                    packageInformation.copyrightText,
                                                )
                                                    ? ''
                                                    : isNotNoneOrNoasserttionString(packageInformation.copyrightText)
                                                      ? packageInformation.copyrightText
                                                      : ''
                                            }
                                            disabled={copyrightTextNone || copyrightTextNoasserttion}
                                        ></textarea>
                                    </div>
                                    <div
                                        style={{
                                            flex: 2,
                                        }}
                                    >
                                        <input
                                            className='spdx-radio'
                                            id='copyrightTextNone'
                                            type='radio'
                                            name='_sw360_portlet_components_COPYRIGHT_TEXT'
                                            value='NONE'
                                            onChange={selectCopyrightTextNone}
                                            checked={copyrightTextNone}
                                        />
                                        <label
                                            style={{
                                                marginRight: '2rem',
                                            }}
                                            className='form-check-label radio-label lableSPDX'
                                            htmlFor='copyrightTextNone'
                                        >
                                            NONE
                                        </label>
                                        <input
                                            className='spdx-radio'
                                            id='copyrightTextNoAssertion'
                                            type='radio'
                                            name='_sw360_portlet_components_COPYRIGHT_TEXT'
                                            value='NOASSERTION'
                                            onChange={selectCopyrightTextNoasserttion}
                                            checked={copyrightTextNoasserttion}
                                        />
                                        <label
                                            className='form-check-label radio-label lableSPDX'
                                            htmlFor='copyrightTextNoAssertion'
                                        >
                                            NOASSERTION
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    {isModeFull && (
                        <>
                            {' '}
                            <tr className='spdx-full'>
                                <td colSpan={3}>
                                    <div className='form-group'>
                                        <label
                                            className='lableSPDX'
                                            htmlFor='packageSummaryDescription'
                                        >
                                            7.18 Package summary description
                                        </label>
                                        <div>
                                            <textarea
                                                className='form-control'
                                                id='packageSummaryDescription'
                                                rows={5}
                                                name='summary'
                                                onChange={updateField}
                                                placeholder='Enter package summary description'
                                                value={packageInformation.summary ?? ''}
                                            ></textarea>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr className='spdx-full'>
                                <td colSpan={3}>
                                    <div className='form-group'>
                                        <label
                                            className='lableSPDX'
                                            htmlFor='packageDetailedDescription'
                                        >
                                            7.19 Package detailed description
                                        </label>
                                        <div>
                                            <textarea
                                                className='form-control'
                                                id='packageDetailedDescription'
                                                rows={5}
                                                name='description'
                                                onChange={updateField}
                                                placeholder='Enter package detailed description'
                                                value={packageInformation.description ?? ''}
                                            ></textarea>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </>
                    )}
                    <tr className='spdx-full'>
                        <td colSpan={3}>
                            <div className='form-group'>
                                <label
                                    className='lableSPDX'
                                    htmlFor='packageComment'
                                >
                                    7.20 Package comment
                                </label>
                                <div>
                                    <textarea
                                        className='form-control'
                                        id='packageComment'
                                        rows={5}
                                        name='packageComment'
                                        onChange={updateField}
                                        placeholder='Enter package comment'
                                        value={packageInformation.packageComment ?? ''}
                                    ></textarea>
                                </div>
                            </div>
                        </td>
                    </tr>
                    {isModeFull && (
                        <>
                            {
                                <tr className='spdx-full'>
                                    <td colSpan={3}>
                                        <div className='form-group section section-external-ref'>
                                            <label className='lableSPDX'>7.21 External references</label>
                                            {
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        paddingLeft: '1rem',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            marginBottom: '0.75rem',
                                                        }}
                                                    >
                                                        <label
                                                            style={{
                                                                textDecoration: 'underline',
                                                            }}
                                                            className='sub-title lableSPDX'
                                                        >
                                                            Select Reference
                                                        </label>
                                                        <select
                                                            className='form-control spdx-select form-select'
                                                            id='externalReferences'
                                                            onChange={displayIndex}
                                                            disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                                                externalRefsDatas,
                                                            )}
                                                            value={
                                                                isAdd
                                                                    ? isDeleteSucces
                                                                        ? indexExternalRefsData
                                                                        : increIndex
                                                                    : numberIndex
                                                            }
                                                        >
                                                            {externalRefsDatas.map((item) => (
                                                                <option
                                                                    key={item.index}
                                                                    value={item.index}
                                                                >
                                                                    {item.index + 1}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <BsFillTrashFill
                                                            className='spdx-delete-icon-main-index'
                                                            onClick={deleteExternalRefsDatas}
                                                            size={20}
                                                        />
                                                    </div>
                                                    <button
                                                        className='spdx-add-button-main'
                                                        name='add-externalRef'
                                                        onClick={addReferences}
                                                    >
                                                        Add new Reference
                                                    </button>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            marginBottom: '0.75rem',
                                                        }}
                                                    >
                                                        <label className='sub-title lableSPDX'>Category</label>
                                                        <select
                                                            style={{
                                                                width: 'auto',
                                                                flex: 'auto',
                                                            }}
                                                            id='referenceCategory'
                                                            className='form-control form-select'
                                                            name='referenceCategory'
                                                            onChange={handleChangeReferenceCategory}
                                                            value={
                                                                externalRefsDatas[indexExternalRefsData]
                                                                    ?.referenceCategory
                                                            }
                                                            disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                                                externalRefsDatas,
                                                            )}
                                                        >
                                                            <option value='SECURITY'>SECURITY</option>
                                                            <option value='PACKAGE-MANAGER'>PACKAGE-MANAGER</option>
                                                            <option value='PERSISTENT-ID'>PERSISTENT-ID</option>
                                                            <option value='OTHER'>OTHER</option>
                                                        </select>
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            marginBottom: '0.75rem',
                                                        }}
                                                    >
                                                        <label className='sub-title lableSPDX'>Type</label>
                                                        {isTypeCateGoryEmpty ? (
                                                            <input
                                                                style={{
                                                                    width: 'auto',
                                                                    flex: 'auto',
                                                                }}
                                                                id='referenceType-2'
                                                                type='text'
                                                                className='form-control'
                                                                placeholder='Enter type'
                                                                name='referenceType'
                                                                onChange={handleChangeExternalRefData}
                                                                value={
                                                                    externalRefsDatas[indexExternalRefsData]
                                                                        ?.referenceType
                                                                }
                                                                disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                                                    externalRefsDatas,
                                                                )}
                                                            />
                                                        ) : (
                                                            <select
                                                                style={{
                                                                    width: 'auto',
                                                                    flex: 'auto',
                                                                }}
                                                                id='referenceType-1'
                                                                className='form-control form-select'
                                                                name='referenceType'
                                                                onChange={handleChangeExternalRefData}
                                                                value={
                                                                    externalRefsDatas[indexExternalRefsData]
                                                                        ?.referenceType
                                                                }
                                                                disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                                                    externalRefsDatas,
                                                                )}
                                                            >
                                                                {typeCategory.map((item, index) => (
                                                                    <option
                                                                        key={index}
                                                                        value={item}
                                                                    >
                                                                        {item}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            marginBottom: '0.75rem',
                                                        }}
                                                    >
                                                        <label className='sub-title lableSPDX'>Locator</label>
                                                        <input
                                                            style={{
                                                                width: 'auto',
                                                                flex: 'auto',
                                                            }}
                                                            type='text'
                                                            className='form-control'
                                                            id='externalReferencesLocator'
                                                            placeholder='Enter locator'
                                                            name='referenceLocator'
                                                            onChange={handleChangeExternalRefData}
                                                            value={
                                                                externalRefsDatas[indexExternalRefsData]
                                                                    ?.referenceLocator
                                                            }
                                                            disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                                                externalRefsDatas,
                                                            )}
                                                        />
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                        }}
                                                    >
                                                        <label className='sub-title lableSPDX'>7.22 Comment</label>
                                                        <textarea
                                                            style={{
                                                                width: 'auto',
                                                                flex: 'auto',
                                                            }}
                                                            rows={5}
                                                            className='form-control'
                                                            id='externalReferencesComment'
                                                            placeholder='Enter comment'
                                                            name='comment'
                                                            onChange={handleChangeExternalRefData}
                                                            value={externalRefsDatas[indexExternalRefsData]?.comment}
                                                            disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                                                externalRefsDatas,
                                                            )}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            }
                        </>
                    )}

                    {isModeFull && (
                        <>
                            <tr className='spdx-full'>
                                <td colSpan={3}>
                                    <div className='form-group'>
                                        <label
                                            className='lableSPDX'
                                            htmlFor='packageAttributionText'
                                        >
                                            7.23 Package attribution text
                                        </label>
                                        <div>
                                            <textarea
                                                className='form-control'
                                                id='packageAttributionText'
                                                rows={5}
                                                name='attributionText'
                                                onChange={updateFieldAttributionText}
                                                placeholder='Enter package attribution text'
                                                value={
                                                    packageInformation.attributionText
                                                        ?.toString()
                                                        .replaceAll(',', '\n') ?? ''
                                                }
                                            ></textarea>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr className='spdx-full'>
                                <td colSpan={3}>
                                    <div className='form-group'>
                                        <label
                                            className='lableSPDX'
                                            htmlFor='primaryPackagePurpose'
                                        >
                                            7.24 Primary Package Purpose
                                        </label>
                                        <div>
                                            <textarea
                                                className='form-control'
                                                id='primaryPackagePurpose'
                                                rows={5}
                                                name='primaryPackagePurpose'
                                                onChange={updateField}
                                                placeholder='Enter primary package purpose'
                                                value={packageInformation.primaryPackagePurpose ?? ''}
                                            ></textarea>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr className='spdx-full'>
                                <ReleaseDate
                                    dataReleaseDate={dataReleaseDate}
                                    setDataReleaseDate={setDataReleaseDate}
                                    setReleaseDate={setReleaseDate}
                                />
                            </tr>
                            <tr className='spdx-full'>
                                <BuiltDate
                                    setBuiltDate={setBuiltDate}
                                    dataBuiltDate={dataBuiltDate}
                                    setDataBuiltDate={setDataBuiltDate}
                                />
                            </tr>
                            <tr className='spdx-full'>
                                <ValidUntilDate
                                    setValidUntilDate={setValidUntilDate}
                                    dataValidUntilDate={dataValidUntilDate}
                                    setDataValidUntilDate={setDataValidUntilDate}
                                />
                            </tr>
                        </>
                    )}
                </>
            </tbody>
        </table>
    )
}

export default EditPackageInformation
