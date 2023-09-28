// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import EmbeddedUser from '@/object-types/EmbeddedUser'
import InputKeyValue from '@/object-types/InputKeyValue'
import Moderators from '@/object-types/Moderators'

const isNullOrUndefined = (obj: unknown) => {
    if (obj === null || obj === undefined) {
        return true
    }
    return false
}

const isNullEmptyOrUndefinedString = (str: string) => {
    if (str === null || str === undefined || str.length === 0) {
        return true
    }
    return false
}

interface Params {
    [key: string]: string
}

const createUrlWithParams = (url: string, params: Params) => {
    const queryString = Object.keys(params)
        .map((key) => {
            return [key, params[key]].map(encodeURIComponent).join('=')
        })
        .join('&')
    return `${url}?${queryString}`
}

const isNullEmptyOrUndefinedArray = (arr: Array<unknown>) => {
    if (arr === null || arr === undefined || arr.length === 0) {
        return true
    }
    return false
}

const getIdFromUrl = (url: string): string => {
    return url.split('/').at(-1)
}

const getObjectModerators = (users: EmbeddedUser[]) => {
    const fullNames: string[] = []
    const moderatorsEmail: string[] = []
    if (users.length == 0) {
        return
    }
    users.forEach((item: EmbeddedUser) => {
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

const getObjectContributors = (users: EmbeddedUser[]) => {
    const fullNames: string[] = []
    const contributorsEmail: string[] = []
    if (users.length == 0) {
        return
    }
    users.forEach((item: EmbeddedUser) => {
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

const getEmailsModerators = (users: EmbeddedUser[]) => {
    const moderatorsEmail: string[] = []
    if (typeof users === 'undefined') {
        return
    }
    users.forEach((item: EmbeddedUser) => {
        moderatorsEmail.push(item.email)
    })

    return moderatorsEmail
}

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

const convertObjectToMapRoles = (data: { [k: string]: Array<string> }) => {
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
}

export default CommonUtils
