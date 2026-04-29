// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

const DEPENDENT_DOCUMENT_ERROR = 'Dependent document Id/ids not valid.'
const INVALID_PURL_MESSAGE = 'Invalid pURL'

export async function getPackageSubmitErrorMessage(
    response: Response,
    submittedPurl: string | undefined,
    fallbackMessage: string,
): Promise<string> {
    const message = extractErrorMessage(await response.text()) ?? fallbackMessage

    if (isPurlErrorMessage(message) && isClearlyInvalidPurl(submittedPurl)) {
        return INVALID_PURL_MESSAGE
    }

    return message
}

function extractErrorMessage(responseText: string): string | undefined {
    const text = responseText.trim()

    if (!text) {
        return undefined
    }

    try {
        const body = JSON.parse(text) as {
            message?: string
        }

        if (typeof body.message === 'string' && body.message.trim()) {
            return body.message.trim()
        }
    } catch {
        // Fall through to XML/plain-text parsing.
    }

    const xmlMessage = text.match(/<message>([\s\S]*?)<\/message>/i)?.[1]?.trim()
    if (xmlMessage) {
        return xmlMessage
    }

    return text
}

function isPurlErrorMessage(message: string): boolean {
    return (
        message === DEPENDENT_DOCUMENT_ERROR ||
        /invalid purl|invalid purl or linked release id|invalid package input/i.test(message) ||
        /Cannot deserialize value of type .*PackageManager/i.test(message)
    )
}

function isClearlyInvalidPurl(purl: string | undefined): boolean {
    return !/^pkg:[A-Za-z0-9.+-]+\/.+/.test(purl?.trim() ?? '')
}
