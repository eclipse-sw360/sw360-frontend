// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

type JsonValue =
    | string
    | number
    | boolean
    | null
    | {
          [key: string]: JsonValue
      }
    | JsonValue[]

import { Changes } from '../../object-types/Changelogs'

function convertToJsonObject(fieldValue: unknown): JsonValue {
    if (fieldValue !== null && fieldValue !== undefined) {
        if (typeof fieldValue === 'object') {
            return fieldValue as JsonValue
        }
        if (typeof fieldValue === 'string') {
            try {
                return JSON.parse(fieldValue) as JsonValue
            } catch {
                return fieldValue
            }
        }
    }
    return null
}

function createElementFromHTML(htmlString: string) {
    const div = document.createElement('div')
    div.innerHTML = htmlString.trim()

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild
}

function createChangesCards(changes: Changes[] | undefined | null, transFieldName: string): void {
    const cardScreen = document.getElementById('cardScreen')
    if (cardScreen === null) return
    cardScreen.innerHTML = ''
    let cardId = 0
    const templateStringHTML = `
    <div id="template" className="d-none">
      <div className="card border-info">
        <div className="card-header cardHeader text-white p-1"
          id="headingOne" data-toggle="collapse"
          data-target="#collapseOne" aria-expanded="true"
          aria-controls="collapseOne">
          <h3 className="mb-0 p-1"></h3>
        </div>
        <div id="collapseOne" className="collapse show"
          aria-labelledby="headingOne" data-parent="#template">
          <div className="p-0 border border-info" id="tableContainer">
          </div>
        </div>
      </div>
    </div>`
    const templateTableStringHtml = `
    <table id="templateTable" cellspacing="10" class="d-none"
      style="width: 100%;table-layout: fixed; font-style: italic">
      <tr id="templateRow">
          <td
              class="text-danger text-justify align-top w-50 p-3 font-italic oldValue"
              style="background-color: #ffeef0; border: 1px solid red; border-radius: 5px">
          </td>
          <td
              class="text-success text-justify align-top w-50 p-3 font-italic newValue"
              style="background-color: #e6ffed; border: 1px solid green; border-radius: 5px">
          </td>
      </tr>
  </table>`

    const templateHtml = createElementFromHTML(templateStringHTML)
    const templateTableHtml = createElementFromHTML(templateTableStringHtml)
    if (changes !== null && changes !== undefined && changes.length > 0) {
        for (let i = 0; i < changes.length; i++) {
            cardId++
            const template = templateHtml?.cloneNode(true) as HTMLElement
            template.classList.remove('d-none')
            template.id = 'template-' + cardId

            const cardHead = template.querySelector('h3')
            if (cardHead === null) return
            cardHead.innerHTML = `${transFieldName}: ` + changes[i].fieldName
            cardHead.style.color = 'white'
            cardHead.style.fontWeight = 'bold'
            cardHead.style.fontSize = '15px'
            cardHead.style.paddingLeft = '10px'
            cardHead.style.paddingRight = '15x'
            cardHead.style.paddingBottom = '15px'
            cardHead.style.paddingTop = '15px'
            cardHead.style.backgroundColor = '#5D8EA9'
            cardHead.style.marginBottom = '0px'
            cardHead.style.marginTop = '10px'

            const changesTable = templateTableHtml?.cloneNode(true) as HTMLElement
            changesTable.classList.remove('d-none')
            changesTable.removeAttribute('id')
            changeLogObjDifferentiator(
                changes[i].fieldValueOld,
                changesTable.querySelectorAll('td')[0],
                'text-danger',
                changes[i].fieldValueNew,
                changesTable.querySelectorAll('td')[1],
                'text-success',
                1,
            )
            const tableContainer = template.querySelector('#tableContainer')
            tableContainer?.append(changesTable)
            tableContainer?.removeAttribute('id')
            const parentNode = tableContainer?.parentElement as HTMLElement
            parentNode.setAttribute('id', 'collapse-' + cardId)
            parentNode.setAttribute('aria-labelledby', 'heading-' + cardId)
            parentNode.setAttribute('data-parent', '#template-' + cardId)
            cardScreen.append(template)
        }
    }
}

function changeLogObjDifferentiator(
    fieldValueOld: JsonValue,
    oldChangesCard: HTMLElement,
    oldChangesCardTextColor: string,
    fieldValueNew: JsonValue,
    newChangesCard: HTMLElement,
    newChangesCardTextColor: string,
    indentlevel: number,
) {
    const leftSpanHightlighter = "<span class='text-dark' style='background-color:#f9b2ba'>",
        rightSpanHighlighter = "<span class='text-dark' style='background-color:#a6f1b8'>"
    fieldValueOld = convertToJsonObject(fieldValueOld)
    fieldValueNew = convertToJsonObject(fieldValueNew)
    let jsonStrOld = null,
        jsonStrNew = null
    if (
        fieldValueOld === null ||
        fieldValueOld === undefined ||
        fieldValueNew === null ||
        fieldValueNew === undefined
    ) {
        removeIndexFields(fieldValueOld)
        removeIndexFields(fieldValueNew)
        jsonStrOld = JSON.stringify(fieldValueOld, undefined, 5).replace(/\\n/g, '\n').replace(/\\r/g, '\r')
        jsonStrNew = JSON.stringify(fieldValueNew, undefined, 5).replace(/\\n/g, '\n').replace(/\\r/g, '\r')
    } else {
        if (Array.isArray(fieldValueOld) && Array.isArray(fieldValueNew)) {
            diffArray(fieldValueOld, fieldValueNew, leftSpanHightlighter, rightSpanHighlighter, 1)
            jsonStrOld = JSON.stringify(fieldValueOld, undefined, 5 * indentlevel)
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
            jsonStrNew = JSON.stringify(fieldValueNew, undefined, 5 * indentlevel)
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
        } else if (
            typeof fieldValueOld === 'object' &&
            fieldValueOld !== null &&
            !Array.isArray(fieldValueOld) &&
            typeof fieldValueNew === 'object' &&
            fieldValueNew !== null &&
            !Array.isArray(fieldValueNew)
        ) {
            diffObject(
                fieldValueOld as {
                    [key: string]: JsonValue
                },
                fieldValueNew as {
                    [key: string]: JsonValue
                },
                leftSpanHightlighter,
                rightSpanHighlighter,
                indentlevel,
            )
            jsonStrOld = JSON.stringify(fieldValueOld, undefined, 5 * indentlevel)
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
            jsonStrNew = JSON.stringify(fieldValueNew, undefined, 5 * indentlevel)
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
        } else if (typeof fieldValueOld === 'string' && typeof fieldValueNew === 'string') {
            const fieldValueOldUnchanged = fieldValueOld
            fieldValueOld = diffString(fieldValueOld, fieldValueNew, leftSpanHightlighter)
            fieldValueNew = diffString(fieldValueNew, fieldValueOldUnchanged, rightSpanHighlighter)
            jsonStrOld = JSON.stringify(fieldValueOld, undefined, 5 * indentlevel)
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
            jsonStrNew = JSON.stringify(fieldValueNew, undefined, 5 * indentlevel)
                .replace(/\\"/g, '"')
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
        } else {
            jsonStrOld = escapeHTML(JSON.stringify(fieldValueOld, undefined, 5 * indentlevel))
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
            jsonStrNew = escapeHTML(JSON.stringify(fieldValueNew, undefined, 5 * indentlevel))
                .replace(/\\n/g, '\n')
                .replace(/\\r/g, '\r')
        }
    }

    jsonStrOld =
        '<pre class="' +
        oldChangesCardTextColor +
        '" style="white-space: pre-wrap;word-break: break-all;">' +
        jsonStrOld +
        '</pre>'
    oldChangesCard.innerHTML = jsonStrOld

    jsonStrNew =
        '<pre class="' +
        newChangesCardTextColor +
        '" style="white-space: pre-wrap;word-break: break-all;">' +
        jsonStrNew +
        '</pre>'
    newChangesCard.innerHTML = jsonStrNew
}

function diffArray(
    fieldValueOld: JsonValue[],
    fieldValueNew: JsonValue[],
    leftSpanHightlighter: string,
    rightSpanHighlighter: string,
    indentlevel: number,
) {
    const fieldValueOldTmp: JsonValue[] = [],
        fieldValueNewTmp: JsonValue[] = [],
        selector = 'attachmentContentId'
    let spaceForClosingBraces = ''

    for (let i = 0; i < indentlevel; i++) {
        spaceForClosingBraces += '     '
    }

    highlightArray(
        fieldValueOld,
        fieldValueOldTmp,
        fieldValueNew,
        fieldValueNewTmp,
        leftSpanHightlighter,
        rightSpanHighlighter,
        spaceForClosingBraces,
        selector,
        true,
        indentlevel,
    )

    highlightArray(
        fieldValueNew,
        fieldValueNewTmp,
        fieldValueOld,
        fieldValueOldTmp,
        rightSpanHighlighter,
        leftSpanHightlighter,
        spaceForClosingBraces,
        selector,
        false,
        indentlevel,
    )

    copyFromSourceToDestinationArray(fieldValueOldTmp, fieldValueOld)
    copyFromSourceToDestinationArray(fieldValueNewTmp, fieldValueNew)
}

function highlightArray(
    primaryField: JsonValue[],
    primaryFieldTmp: JsonValue[],
    secondaryField: JsonValue[],
    secondaryFieldTmp: JsonValue[],
    primarySpanHightlighter: string,
    secondarySpanHighlighter: string,
    spaceForClosingBraces: string,
    selector: string,
    differentiateObject: boolean,
    indentlevel: number,
) {
    for (const primaryValue of primaryField) {
        if (typeof primaryValue === 'object') {
            let matched = false
            const indexKey = 'index'
            for (const secondaryValue of secondaryField) {
                if (isEqualObject(secondaryValue, primaryValue, selector, indexKey)) {
                    matched = true
                    if (differentiateObject) {
                        const pObj = primaryValue as {
                            [key: string]: JsonValue
                        }
                        const sObj = secondaryValue as {
                            [key: string]: JsonValue
                        }
                        delete pObj[indexKey]
                        delete sObj[indexKey]
                        diffObject(pObj, sObj, primarySpanHightlighter, secondarySpanHighlighter, indentlevel)
                        primaryFieldTmp.push(primaryValue)
                        secondaryFieldTmp.push(secondaryValue)
                    }
                    break
                }
            }
            if (!matched) {
                removeIndexFields(primaryValue)
                let jsonString = JSON.stringify(primaryValue, undefined, 10 * indentlevel)
                jsonString =
                    jsonString.substring(0, jsonString.length - 1) +
                    spaceForClosingBraces +
                    jsonString.substring(jsonString.length - 1)
                primaryFieldTmp.push((primarySpanHightlighter + jsonString + '</span>') as JsonValue)
            }
        } else {
            if (secondaryField.includes(primaryValue)) {
                primaryFieldTmp.push(primaryValue)
            } else {
                primaryFieldTmp.push((primarySpanHightlighter + primaryValue + '</span>') as JsonValue)
            }
        }
    }
}

function isEqualObject(secondaryValue: JsonValue, primaryValue: JsonValue, selector: string, indexKey: string) {
    if (
        typeof primaryValue === 'object' &&
        primaryValue !== null &&
        typeof secondaryValue === 'object' &&
        secondaryValue !== null
    ) {
        const pObj = primaryValue as {
            [key: string]: JsonValue
        }
        const sObj = secondaryValue as {
            [key: string]: JsonValue
        }
        if (pObj[selector] === sObj[selector] && typeof pObj[indexKey] === 'undefined') {
            return true
        }
        if (pObj[indexKey] === sObj[indexKey] && typeof pObj[selector] === 'undefined') {
            return true
        }
    }
    return false
}

function removeIndexFields(object: JsonValue) {
    if (Array.isArray(object)) {
        for (const objectValue of object) {
            removeIndexFields(objectValue)
        }
    } else if (typeof object === 'object' && object !== null) {
        const obj = object as {
            [key: string]: JsonValue
        }
        for (const key in obj) {
            if (key === 'index') {
                delete obj[key]
            }
            if (typeof obj[key] === 'object') {
                removeIndexFields(obj[key])
            }
        }
    }
}

function copyFromSourceToDestinationArray(srcArr: JsonValue[], destArr: JsonValue[]) {
    destArr.length = 0
    for (const obj of srcArr) {
        destArr.push(obj)
    }
}

function diffObject(
    fieldValueOld: {
        [key: string]: JsonValue
    },
    fieldValueNew: {
        [key: string]: JsonValue
    },
    leftSpanHightlighter: string,
    rightSpanHighlighter: string,
    indentlevel: number,
) {
    let spaceForClosingBraces = ''
    for (let i = 0; i < indentlevel; i++) {
        spaceForClosingBraces += '     '
    }
    highlightObject(
        fieldValueOld,
        fieldValueNew,
        leftSpanHightlighter,
        rightSpanHighlighter,
        true,
        spaceForClosingBraces,
        indentlevel,
    )
    highlightObject(
        fieldValueNew,
        fieldValueOld,
        rightSpanHighlighter,
        leftSpanHightlighter,
        false,
        spaceForClosingBraces,
        indentlevel,
    )
}

function highlightObject(
    fieldValuePrimary: {
        [key: string]: JsonValue
    },
    fieldValueSecondary: {
        [key: string]: JsonValue
    },
    primarySpanHightlighter: string,
    secondarySpanHighlighter: string,
    differentiateCommonObject: boolean,
    spaceForClosingBraces: string,
    indentlevel: number,
) {
    for (const key in fieldValuePrimary) {
        if (key === 'index') {
            delete fieldValuePrimary[key]
            delete fieldValueSecondary[key]
            continue
        }
        if (fieldValueSecondary[key] === null || fieldValueSecondary[key] === undefined) {
            let highlighted = fieldValuePrimary[key]
            if (typeof fieldValuePrimary[key] === 'object') {
                highlighted = JSON.stringify(fieldValuePrimary[key], undefined, 5 * (indentlevel + 1))
                highlighted =
                    highlighted.substring(0, highlighted.length - 1) +
                    spaceForClosingBraces +
                    highlighted.substring(highlighted.length - 1)
            }
            fieldValuePrimary[primarySpanHightlighter + key + '</span>'] =
                primarySpanHightlighter + highlighted + '</span>'
            delete fieldValuePrimary[key]
        } else if (differentiateCommonObject) {
            if (typeof fieldValuePrimary[key] === 'string' && typeof fieldValueSecondary[key] === 'string') {
                const fieldValuePrimaryKeyValueUnchanged = fieldValuePrimary[key]
                fieldValuePrimary[key] = diffString(
                    fieldValuePrimary[key],
                    fieldValueSecondary[key],
                    primarySpanHightlighter,
                )
                fieldValueSecondary[key] = diffString(
                    fieldValueSecondary[key],
                    fieldValuePrimaryKeyValueUnchanged,
                    secondarySpanHighlighter,
                )
            } else if (Array.isArray(fieldValuePrimary[key]) && Array.isArray(fieldValueSecondary[key])) {
                diffArray(
                    fieldValuePrimary[key] as JsonValue[],
                    fieldValueSecondary[key] as JsonValue[],
                    primarySpanHightlighter,
                    secondarySpanHighlighter,
                    1,
                )
            } else {
                diffObject(
                    fieldValuePrimary[key] as {
                        [key: string]: JsonValue
                    },
                    fieldValueSecondary[key] as {
                        [key: string]: JsonValue
                    },
                    primarySpanHightlighter,
                    secondarySpanHighlighter,
                    indentlevel + 1,
                )
            }
        }
    }
}

function prepareDiffString(changesArrTmp: string[], result: string, highLighter: string, val: string) {
    if (changesArrTmp.length !== 0) {
        if (result.length != 0) {
            result += ' '
        }
        changesArrTmp.join(' ')
        result += highLighter + changesArrTmp.join('') + '</span>'
    }
    if (result.length != 0) {
        result += ' '
    }
    result += escapeHTML(val)
    changesArrTmp.length = 0

    return result
}

function diffString(fieldValuePrimary: string, fieldValueSecondary: string, highLighter: string) {
    if (fieldValuePrimary === fieldValueSecondary) {
        return escapeHTML(fieldValuePrimary)
    }

    const fieldValuePrimaryArr = fieldValuePrimary.split(' '),
        fieldValueSecondaryArr = fieldValueSecondary.split(' '),
        changesArrTmp: string[] = []
    let i = 0,
        j = 0,
        result = ''

    while (i < fieldValuePrimaryArr.length) {
        if (fieldValuePrimaryArr[i] === fieldValueSecondaryArr[j]) {
            result = prepareDiffString(changesArrTmp, result, highLighter, fieldValuePrimaryArr[i])
            j++
        } else {
            const index = fieldValueSecondaryArr.indexOf(fieldValuePrimaryArr[i])
            if (index === -1) {
                changesArrTmp.push(fieldValuePrimaryArr[i])
            } else {
                result = prepareDiffString(changesArrTmp, result, highLighter, fieldValuePrimaryArr[i])
                j = index
            }
        }
        i++
    }

    if (changesArrTmp.length !== 0) {
        if (result.length != 0) {
            result += ' '
        }
        changesArrTmp.join(' ')
        result += highLighter + changesArrTmp.join('') + '</span>'
    }
    return result
}

function escapeHTML(unsafeText: string) {
    const div = document.createElement('div')
    div.innerText = unsafeText
    return unsafeText
}

export default createChangesCards
