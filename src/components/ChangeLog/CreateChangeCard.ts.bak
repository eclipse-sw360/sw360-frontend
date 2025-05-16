// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Changes } from '../../object-types/Changelogs'

function convertToJsonObject(fieldValue: any) {
  if (fieldValue !== null && fieldValue !== undefined) {
    if (typeof fieldValue === 'object') {
      return fieldValue;
    } else if (typeof fieldValue == 'string') {
      return fieldValue
    } else {
      return JSON.parse(fieldValue);
    }
  }
  return null;
}

function createElementFromHTML(htmlString: string) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

function createChangesCards(changes: Changes[] | undefined | null, transFieldName: string) : void {
  const cardScreen = document.getElementById('cardScreen')
  if (cardScreen === null) return
  cardScreen.innerHTML = ''
  let cardId = 0;
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

  const templateHtml = createElementFromHTML(templateStringHTML);
  const templateTableHtml = createElementFromHTML(templateTableStringHtml);
  if (changes !== null && changes !== undefined && changes.length > 0) {
    for (let i = 0; i < changes.length; i++) {
      cardId++;
      const template = templateHtml?.cloneNode(true) as HTMLElement
      template.classList.remove("d-none");
      template.id = "template-" + cardId;

      const cardHead = template.querySelector("h3")
      if (cardHead === null) return
      cardHead.innerHTML = `${transFieldName}: ` + changes[i].fieldName;
      cardHead.style.color = 'white';
      cardHead.style.fontWeight = 'bold';
      cardHead.style.fontSize = '15px';
      cardHead.style.paddingLeft = '10px';
      cardHead.style.paddingRight = '15x';
      cardHead.style.paddingBottom = '15px';
      cardHead.style.paddingTop = '15px';
      cardHead.style.backgroundColor = '#5D8EA9';
      cardHead.style.marginBottom = '0px';
      cardHead.style.marginTop = '10px';


      const changesTable = templateTableHtml?.cloneNode(true) as HTMLElement;
      changesTable.classList.remove("d-none");
      changesTable.removeAttribute("id");
      changeLogObjDifferentiator(changes[i].fieldValueOld, changesTable.querySelectorAll("td")[0], "text-danger",
        changes[i].fieldValueNew, changesTable.querySelectorAll("td")[1], "text-success", 1);
      const tableContainer = template.querySelector("#tableContainer");
      tableContainer?.append(changesTable);
      tableContainer?.removeAttribute("id");
      const parentNode = tableContainer?.parentElement as HTMLElement;
      parentNode.setAttribute("id", "collapse-" + cardId)
      parentNode.setAttribute("aria-labelledby", "heading-" + cardId)
      parentNode.setAttribute("data-parent", "#template-" + cardId);
      cardScreen.append(template);
    }
  }
}

function changeLogObjDifferentiator(fieldValueOld: any, oldChangesCard: HTMLElement, oldChangesCardTextColor: string, fieldValueNew: any, newChangesCard: HTMLElement, newChangesCardTextColor: string, indentlevel: number) {
  const leftSpanHightlighter = "<span class='text-dark' style='background-color:#f9b2ba'>",
    rightSpanHighlighter = "<span class='text-dark' style='background-color:#a6f1b8'>"
  fieldValueOld = convertToJsonObject(fieldValueOld);
  fieldValueNew = convertToJsonObject(fieldValueNew);
  let jsonStrOld = null,
    jsonStrNew = null;
  if (fieldValueOld === null || fieldValueOld === undefined ||
    fieldValueNew === null || fieldValueNew === undefined) {
    removeIndexFields(fieldValueOld);
    removeIndexFields(fieldValueNew);
    jsonStrOld = JSON.stringify(fieldValueOld, undefined, 5).replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    jsonStrNew = JSON.stringify(fieldValueNew, undefined, 5).replace(/\\n/g, '\n').replace(/\\r/g, '\r');
  }
  else {
    if (Array.isArray(fieldValueOld) && Array.isArray(fieldValueNew)) {
      diffArray(fieldValueOld, fieldValueNew, leftSpanHightlighter, rightSpanHighlighter, 1);
      jsonStrOld = JSON.stringify(fieldValueOld, undefined, 5 * indentlevel).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
      jsonStrNew = JSON.stringify(fieldValueNew, undefined, 5 * indentlevel).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    }
    else if (typeof fieldValueOld === 'object' && typeof fieldValueNew === 'object') {
      diffObject(fieldValueOld, fieldValueNew, leftSpanHightlighter, rightSpanHighlighter, indentlevel);
      jsonStrOld = JSON.stringify(fieldValueOld, undefined, 5 * indentlevel).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
      jsonStrNew = JSON.stringify(fieldValueNew, undefined, 5 * indentlevel).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    } else if (typeof fieldValueOld === 'string' && typeof fieldValueNew === 'string') {
      const fieldValueOldUnchanged = fieldValueOld;
      fieldValueOld = diffString(fieldValueOld, fieldValueNew, leftSpanHightlighter);
      fieldValueNew = diffString(fieldValueNew, fieldValueOldUnchanged, rightSpanHighlighter);
      jsonStrOld = JSON.stringify(fieldValueOld, undefined, 5 * indentlevel).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
      jsonStrNew = JSON.stringify(fieldValueNew, undefined, 5 * indentlevel).replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    }
    else {
      jsonStrOld = escapeHTML(JSON.stringify(fieldValueOld, undefined, 5 * indentlevel)).replace(/\\n/g, '\n').replace(/\\r/g, '\r');
      jsonStrNew = escapeHTML(JSON.stringify(fieldValueNew, undefined, 5 * indentlevel)).replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    }
  }

  jsonStrOld = '<pre class="' + oldChangesCardTextColor + '" style="white-space: pre-wrap;word-break: break-all;">' + jsonStrOld + '</pre>';
  oldChangesCard.innerHTML = jsonStrOld;

  jsonStrNew = '<pre class="' + newChangesCardTextColor + '" style="white-space: pre-wrap;word-break: break-all;">' + jsonStrNew + '</pre>';
  newChangesCard.innerHTML = jsonStrNew;
}

function diffArray(fieldValueOld: any, fieldValueNew: any, leftSpanHightlighter: any, rightSpanHighlighter: any, indentlevel: number) {
  const fieldValueOldTmp: Array<any> = [],
    fieldValueNewTmp: Array<any> = [],
    selector = "attachmentContentId";
  let spaceForClosingBraces = "";

  for (let i = 0; i < indentlevel; i++) {
    spaceForClosingBraces += "     ";
  }

  highlightArray(fieldValueOld, fieldValueOldTmp, fieldValueNew, fieldValueNewTmp, leftSpanHightlighter, rightSpanHighlighter,
    spaceForClosingBraces, selector, true, indentlevel);

  highlightArray(fieldValueNew, fieldValueNewTmp, fieldValueOld, fieldValueOldTmp, rightSpanHighlighter, leftSpanHightlighter,
    spaceForClosingBraces, selector, false, indentlevel);

  copyFromSourceToDestinationArray(fieldValueOldTmp, fieldValueOld);
  copyFromSourceToDestinationArray(fieldValueNewTmp, fieldValueNew);
}

function highlightArray(primaryField: any, primaryFieldTmp: Array<any>, secondaryField: any, secondaryFieldTmp: Array<any>,
  primarySpanHightlighter: string, secondarySpanHighlighter: string, spaceForClosingBraces: any,
  selector: any, differentiateObject: any, indentlevel: any) {
  for (const primaryValue of primaryField) {
    if (typeof primaryValue === 'object') {
      let matched = false;
      const indexKey = "index";
      for (const secondaryValue of secondaryField) {
        if (isEqualObject(secondaryValue, primaryValue, selector, indexKey)) {
          matched = true;
          if (differentiateObject) {
            delete primaryValue[indexKey];
            delete secondaryValue[indexKey];
            diffObject(primaryValue, secondaryValue, primarySpanHightlighter, secondarySpanHighlighter, indentlevel);
            primaryFieldTmp.push(primaryValue);
            secondaryFieldTmp.push(secondaryValue);
          }
          break;
        }
      }
      if (!matched) {
        removeIndexFields(primaryValue);
        let jsonString = JSON.stringify(primaryValue, undefined, 10 * indentlevel);
        jsonString = jsonString.substring(0, jsonString.length - 1) + spaceForClosingBraces + jsonString.substring(jsonString.length - 1);
        primaryFieldTmp.push(primarySpanHightlighter + jsonString + '</span>');
      }
    } else {
      if (secondaryField.includes(primaryValue)) {
        primaryFieldTmp.push(primaryValue);
      } else {
        primaryFieldTmp.push(primarySpanHightlighter + primaryValue + '</span>');
      }
    }
  }
}

function isEqualObject(secondaryValue: any, primaryValue: any, selector: any, indexKey: any) {
  if (primaryValue[selector] === secondaryValue[selector] && typeof primaryValue[indexKey] === 'undefined') {
    return true;
  }
  if (primaryValue[indexKey] === secondaryValue[indexKey] && typeof primaryValue[selector] === 'undefined') {
    return true;
  }
  return false;
}

function removeIndexFields(object: any) {
  if (Array.isArray(object)) {
    for (const objectValue of object) {
      removeIndexFields(objectValue);
    }
  } else if (typeof object === 'object') {
    for (const key in object) {
      if (key === 'index') {
        delete object[key];
      }
      if (typeof object[key] === 'object') {
        removeIndexFields(object[key]);
      }
    }
  }
}

function copyFromSourceToDestinationArray(srcArr: Array<any>, destArr: Array<any>) {
  destArr.length = 0;
  for (const obj of srcArr) {
    destArr.push(obj);
  }
}

function diffObject(fieldValueOld: any, fieldValueNew: any, leftSpanHightlighter: any, rightSpanHighlighter: any, indentlevel: any) {
  let spaceForClosingBraces = "";
  for (let i = 0; i < indentlevel; i++) {
    spaceForClosingBraces += "     ";
  }
  highlightObject(fieldValueOld, fieldValueNew, leftSpanHightlighter, rightSpanHighlighter, true, spaceForClosingBraces, indentlevel);
  highlightObject(fieldValueNew, fieldValueOld, rightSpanHighlighter, leftSpanHightlighter, false, spaceForClosingBraces, indentlevel);
}

function highlightObject(fieldValuePrimary: any, fieldValueSecondary: any, primarySpanHightlighter: any, secondarySpanHighlighter: any, differentiateCommonObject: any, spaceForClosingBraces: any, indentlevel: any) {
  for (const key in fieldValuePrimary) {
    if (key === 'index') {
      delete fieldValuePrimary[key];
      delete fieldValueSecondary[key];
      continue;
    }
    if (fieldValueSecondary[key] === null || fieldValueSecondary[key] === undefined) {
      let highlighted = fieldValuePrimary[key];
      if (typeof fieldValuePrimary[key] === 'object') {
        highlighted = JSON.stringify(fieldValuePrimary[key], undefined, 5 * (indentlevel + 1))
        highlighted = highlighted.substring(0, highlighted.length - 1) + spaceForClosingBraces + highlighted.substring(highlighted.length - 1);
      }
      fieldValuePrimary[primarySpanHightlighter + key + '</span>'] = primarySpanHightlighter + highlighted + '</span>';
      delete fieldValuePrimary[key];
    } else if (differentiateCommonObject) {
      if (typeof fieldValuePrimary[key] === 'string' && typeof fieldValueSecondary[key] === 'string') {
        const fieldValuePrimaryKeyValueUnchanged = fieldValuePrimary[key];
        fieldValuePrimary[key] = diffString(fieldValuePrimary[key], fieldValueSecondary[key], primarySpanHightlighter);
        fieldValueSecondary[key] = diffString(fieldValueSecondary[key], fieldValuePrimaryKeyValueUnchanged, secondarySpanHighlighter);
      } else if (Array.isArray(fieldValuePrimary[key]) && Array.isArray(fieldValueSecondary[key])) {
        diffArray(fieldValuePrimary[key], fieldValueSecondary[key], primarySpanHightlighter, secondarySpanHighlighter, 1);
      }
      else {
        diffObject(fieldValuePrimary[key], fieldValueSecondary[key], primarySpanHightlighter, secondarySpanHighlighter, indentlevel + 1)
      }
    }
  }
}

function prepareDiffString(changesArrTmp: any, result: string, highLighter: any, val: any) {
  if (changesArrTmp.length !== 0) {
    if (result.length != 0) {
      result += " ";
    }
    changesArrTmp.join(" ")
    result += (highLighter + changesArrTmp.join('') + '</span>');
  }
  if (result.length != 0) {
    result += " ";
  }
  result += escapeHTML(val);
  changesArrTmp.length = 0;

  return result;
}

function diffString(fieldValuePrimary: any, fieldValueSecondary: any, highLighter: any) {
  if (fieldValuePrimary === fieldValueSecondary) {
    return escapeHTML(fieldValuePrimary);
  }

  const fieldValuePrimaryArr = fieldValuePrimary.split(" "),
    fieldValueSecondaryArr = fieldValueSecondary.split(" "),
    changesArrTmp: Array<any> = [];
  let i = 0,
    j = 0,
    result = "";

  while (i < fieldValuePrimaryArr.length) {
    if (fieldValuePrimaryArr[i] === fieldValueSecondaryArr[j]) {
      result = prepareDiffString(changesArrTmp, result, highLighter, fieldValuePrimaryArr[i]);
      j++;
    } else {
      const index = fieldValueSecondaryArr.indexOf(fieldValuePrimaryArr[i]);
      if (index === -1) {
        changesArrTmp.push(fieldValuePrimaryArr[i]);
      } else {
        result = prepareDiffString(changesArrTmp, result, highLighter, fieldValuePrimaryArr[i]);
        j = index;
      }
    }
    i++;
  }

  if (changesArrTmp.length !== 0) {
    if (result.length != 0) {
      result += " ";
    }
    changesArrTmp.join(" ")
    result += (highLighter + changesArrTmp.join('') + '</span>');
  }
  return result;
}

function escapeHTML(unsafeText: string) {
  const div = document.createElement('div');
  div.innerText = unsafeText;
  return unsafeText;
}


export default createChangesCards