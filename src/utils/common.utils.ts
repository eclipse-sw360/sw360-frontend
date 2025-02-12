// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { InputKeyValue, User } from '@/object-types'

/**
 * Checks if the given object is null or undefined.
 * @param obj - The object to check.
 * @returns True if the object is null or undefined, false otherwise.
 */
const isNullOrUndefined = (obj: unknown): obj is null | undefined => {
    if (obj === null || obj === undefined) {
        return true
    }
    return false
}

/**
 * Checks if a string is null, empty or undefined.
 * @param str - The string to check.
 * @returns True if the string is null, empty or undefined, false otherwise.
 */
const isNullEmptyOrUndefinedString = (str: string | undefined | null): str is null | undefined | '' => {
    if (isNullOrUndefined(str))
        return true
    if (str.length === 0) {
        return true
    }
    return false
}

interface UrlWithParams {
    [key: string]: string
}

/**
 * Creates a URL with query parameters.
 *
 * @param url - The base URL.
 * @param params - An object containing the query parameters.
 * @returns The URL with the query parameters.
 */
const createUrlWithParams = (url: string, params: UrlWithParams): string => {
    const queryString = Object.keys(params)
        .filter((key) => params[key])
        .map((key) => {
            return [key, params[key]].map(encodeURIComponent).join('=')
        })
        .join('&')
    return `${url}?${queryString}`
}

/**
 * Checks if an array is null, empty or undefined.
 * @param arr - The array to check.
 * @returns True if the array is null, empty or undefined, false otherwise.
 */
const isNullEmptyOrUndefinedArray = (arr: Array<unknown> | undefined | null): arr is null | undefined => {
    if (isNullOrUndefined(arr))
        return true
    if (arr.length === 0) {
        return true
    }
    return false
}

/**
 * Extracts the ID from a URL string.
 * @param url - The URL string to extract the ID from.
 * @returns The ID extracted from the URL string.
 */
const getIdFromUrl = (url: string | undefined): string => {
    if (isNullEmptyOrUndefinedString(url)) return ''
    return url.split('/').at(-1) ?? ''
}

/**
 * Returns an array of email addresses for the given array of users.
 * @param users - An array of User objects.
 * @returns An array of email addresses.
 */
const getEmailsModerators = (users: User[]): string[] => {
    const moderatorsEmail: string[] = []
    if (typeof users === 'undefined') {
        return []
    }
    users.forEach((item: User) => {
        moderatorsEmail.push(item.email)
    })

    return moderatorsEmail
}

/**
 * Converts an object to a map of key-value pairs.
 * @param data - The object to convert.
 * @returns An array of key-value pairs.
 */
const convertObjectToMap = (data: { [k: string]: string }): InputKeyValue[] => {
    const map = new Map(Object.entries(data))
    const inputs: InputKeyValue[] = []
    map.forEach((value, key) => {
        const input: InputKeyValue = {
            key: key,
            value: value,
        }
        inputs.push(input)
    })
    return inputs
}

/**
 * Converts an object with string keys and string array values to an array of key-value pairs.
 * @param data - The object to convert.
 * @returns An array of key-value pairs.
 */
const convertObjectToMapRoles = (data: { [k: string]: Array<string> } | null | undefined): InputKeyValue[] => {
    if (isNullOrUndefined(data))
        return []
    const inputRoles: InputKeyValue[] = []
    const mapRoles = new Map(Object.entries(data))
    mapRoles.forEach((value, key) => {
        for (let index = 0; index < value.length; index++) {
            const input: InputKeyValue = {
                key: key,
                value: value.at(index) ?? '',
            }
            inputRoles.push(input)
        }
    })
    return inputRoles
}

/**
 * Converts an array of key-value pairs into an object with keys for each role type and an array of values for each role.
 * @param datas - The array of key-value pairs to convert.
 * @returns An object with keys for each role type and an array of values for each role.
 */
const convertRoles = (datas: InputKeyValue[]): { [key: string]: string[] } => {
    const contributors: string[] = []
    const committers: string[] = []
    const expecters: string[] = []
    const stakeholder: string[] = []
    const analyst: string[] = []
    const accountant: string[] = []
    const endUser: string[] = []
    const qualityManager: string[] = []
    const testManager: string[] = []
    const technicalWriter: string[] = []
    const keyUser: string[] = []

    datas.forEach((data) => {
        if (data.key === 'Contributor') {
            contributors.push(data.value)
        } else if (data.key === 'Committer') {
            committers.push(data.value)
        } else if (data.key === 'Expert') {
            expecters.push(data.value)
        } else if (data.key === 'Stakeholder') {
            stakeholder.push(data.value)
        } else if (data.key === 'Analyst') {
            analyst.push(data.value)
        } else if (data.key === 'Accountant') {
            accountant.push(data.value)
        } else if (data.key === 'EndUser') {
            endUser.push(data.value)
        } else if (data.key === 'QualityManager') {
            qualityManager.push(data.value)
        } else if (data.key === 'TestManager') {
            testManager.push(data.value)
        } else if (data.key === 'TechnicalWriter') {
            technicalWriter.push(data.value)
        } else if (data.key === 'KeyUser') {
            keyUser.push(data.value)
        }
    })
    const roles = {
        Contributor: contributors,
        Committer: committers,
        Expert: expecters,
        Stakeholder: stakeholder,
        Analyst: analyst,
        Accountant: accountant,
        EndUser: endUser,
        QualityManager: qualityManager,
        TestManager: testManager,
        TechnicalWriter: technicalWriter,
        KeyUser: keyUser,
    }
    return roles
}

/**
 * Truncates a given text to a maximum length while preserving full words.
 * @param text - The text to truncate.
 * @param maxLength - The maximum length of the truncated text.
 * @returns The truncated text.
 */
const truncateText = (text: string, maxLength = 80): string => {
    if (text.length <= maxLength) {
        return text
    }

    let truncatedText = text.substring(0, maxLength)
    const lastSpaceIndex = truncatedText.lastIndexOf(' ')

    if (lastSpaceIndex !== -1) {
        truncatedText = truncatedText.substring(0, lastSpaceIndex)
    }

    truncatedText = truncatedText + '...'

    return truncatedText
}

/**
 * Extract user emails and fullNames from array of user following format {'email': 'fullName'}
 * For example:
 * {
 *    'admin@sw360.org': 'Admin user',
 *    'user@sw360.org': 'User 1'
 * }
 * @param users - The array of users.
 * @returns Object contain emails and full names are extracted from array of users.
 */

const fillDate = (value: string): string => {
    const timeStamp = Date.parse(value)

    const date = new Date(timeStamp)

    const localTimeStamp = timeStamp - date.getTimezoneOffset()

    const localDate = new Date(localTimeStamp)

    return (
        localDate.getFullYear() +
        '-' +
        (localDate.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        localDate.getDate().toString().padStart(2, '0')
    )
}

const fillTime = (value: string): string => {
    const timeStamp = Date.parse(value)

    const date = new Date(timeStamp)

    return (
        date.getHours().toString().padStart(2, '0') +
        ':' +
        date.getMinutes().toString().padStart(2, '0') +
        ':' +
        date.getSeconds().toString().padStart(2, '0')
    )
}

const readDateTime = (datePicker: string, timePicker: string): string => {
    if (datePicker == '' || timePicker == '') {
        return ''
    }
    const localDate = new Date(datePicker + ' ' + timePicker)
    return localDate.toISOString().slice(0, -5) + 'Z'
}

const extractEmailsAndFullNamesFromUsers = (users: Array<User>): { [k: string]: string } => {
    return users.reduce(
        (result, user) => {
            result[user.email] = user.fullName ?? ''
            return result
        },
        {} as { [k: string]: string },
    )
}

const nullToEmptyString = (item: string | null | undefined): string => (item != null ? item : '')

const CommonUtils = {
    isNullOrUndefined,
    isNullEmptyOrUndefinedString,
    createUrlWithParams,
    isNullEmptyOrUndefinedArray,
    getIdFromUrl,
    getEmailsModerators,
    convertObjectToMap,
    convertObjectToMapRoles,
    convertRoles,
    truncateText,
    extractEmailsAndFullNamesFromUsers,
    fillDate,
    fillTime,
    readDateTime,
    nullToEmptyString,
}

export default CommonUtils
