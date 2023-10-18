// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

const getJsonPrettyFormat = (obj: any) => {
    let jsonView: any = JSON.stringify(obj, undefined, 5)
    if (obj !== null && obj !== undefined) {
        jsonView = <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}> {jsonView} </pre>
    }
    return jsonView
}

const getJsonArrPrettyFormat = (obj: any) => {
    let jsonView: any = JSON.stringify(obj, undefined, 5)
    if (obj !== null && obj !== undefined && obj.length > 0) {
        jsonView = <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}> {jsonView} </pre>
    }
    return jsonView
}

const getStringPrettyFormat = (string: string) => {
    const jsonView = <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}> {`"${string}"`} </pre>

    return jsonView
}

function PrettyFormatData({ data }: any) {
    if (data === null || data === undefined) {
        return <pre> </pre>
    }

    if (typeof data === 'string') {
        return getStringPrettyFormat(data)
    }

    if (typeof data === 'object') {
        if (Array.isArray(data)) {
            return getJsonArrPrettyFormat(data)
        }

        return getJsonPrettyFormat(data)
    }
}

export default PrettyFormatData
