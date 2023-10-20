// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { InputKeyValue, Moderators, User } from '@/object-types'

/**
 * Checks if the given object is null or undefined.
 * @param obj - The object to check.
 * @returns True if the object is null or undefined, false otherwise.
 */
const isNullOrUndefined = (obj: unknown) => {
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
const isNullEmptyOrUndefinedString = (str: string) => {
    if (str === null || str === undefined || str.length === 0) {
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
const createUrlWithParams = (url: string, params: UrlWithParams) => {
    const queryString = Object.keys(params)
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
const isNullEmptyOrUndefinedArray = (arr: Array<unknown>) => {
    if (arr === null || arr === undefined || arr.length === 0) {
        return true
    }
    return false
}

/**
 * Extracts the ID from a URL string.
 * @param url - The URL string to extract the ID from.
 * @returns The ID extracted from the URL string.
 */
const getIdFromUrl = (url: string): string => {
    return url.split('/').at(-1)
}

/**
 * Returns an object containing the full names and emails of the moderators.
 * @param users - An array of User objects representing the moderators.
 * @returns An object containing the full names and emails of the moderators.
 */
const getObjectModerators = (users: User[]) => {
    const fullNames: string[] = []
    const moderatorsEmail: string[] = []
    if (users.length == 0) {
        return
    }
    users.forEach((item: User) => {
        fullNames.push(item.fullName)
        moderatorsEmail.push(item.email)
    })
    const moderatorsName: string = fullNames.join(' , ')
    const moderatorsResponse: Moderators = {
        fullName: moderatorsName,
        emails: moderatorsEmail,
    }
    return moderatorsResponse
}

/**
 * Returns an object containing the full names and emails of the contributors.
 * @param users An array of User objects representing the contributors.
 * @returns An object containing the full names and emails of the contributors.
 */
const getObjectContributors = (users: User[]) => {
    const fullNames: string[] = []
    const contributorsEmail: string[] = []
    if (users.length == 0) {
        return
    }
    users.forEach((item: User) => {
        fullNames.push(item.fullName)
        contributorsEmail.push(item.email)
    })
    const contributorsName: string = fullNames.join(' , ')
    const contributorsResponse: Moderators = {
        fullName: contributorsName,
        emails: contributorsEmail,
    }
    return contributorsResponse
}

/**
 * Returns an array of email addresses for the given array of users.
 * @param users - An array of User objects.
 * @returns An array of email addresses.
 */
const getEmailsModerators = (users: User[]) => {
    const moderatorsEmail: string[] = []
    if (typeof users === 'undefined') {
        return
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
const convertObjectToMap = (data: { [k: string]: string }) => {
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
const convertObjectToMapRoles = (data: { [k: string]: Array<string> }) => {
    if (data === undefined) {
        return []
    }
    const inputRoles: InputKeyValue[] = []
    const mapRoles = new Map(Object.entries(data))
    mapRoles.forEach((value, key) => {
        for (let index = 0; index < value.length; index++) {
            const input: InputKeyValue = {
                key: key,
                value: value.at(index),
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
const convertRoles = (datas: InputKeyValue[]) => {
    if (datas === null) {
        return null
    }
    const contributors: string[] = []
    const commiters: string[] = []
    const expecters: string[] = []
    datas.forEach((data) => {
        if (data.key === 'Contributor') {
            contributors.push(data.value)
        } else if (data.key === 'Committer') {
            commiters.push(data.value)
        } else if (data.key === 'Expert') {
            expecters.push(data.value)
        }
    })
    const roles = {
        Contributor: contributors,
        Committer: commiters,
        Expert: expecters,
    }
    return roles
}

/**
 * Truncates a given text to a maximum length while preserving full words.
 * @param text - The text to truncate.
 * @param maxLength - The maximum length of the truncated text.
 * @returns The truncated text.
 */
const truncateText = (text: string, maxLength = 80) => {
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

const CommonUtils = {
    isNullOrUndefined,
    isNullEmptyOrUndefinedString,
    createUrlWithParams,
    isNullEmptyOrUndefinedArray,
    getIdFromUrl,
    getObjectModerators,
    getObjectContributors,
    getEmailsModerators,
    convertObjectToMap,
    convertObjectToMapRoles,
    convertRoles,
    truncateText,
}

export default CommonUtils
