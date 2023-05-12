// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

const isNullOrUndefined = (obj: any) => {
  if (obj === null || obj === undefined) {
    return true;
  }
  return false;
}

const isNullEmptyOrUndefinedString = (str: string) => {
  if (str === null || str === undefined || str.length === 0) {
    return true;
  }
  return false;
}

const createUrlWithParams = (url: string, params: any) => {
  let queryString =  Object.keys(params).map((key) => {
    return [key, params[key]].map(encodeURIComponent).join('=');
  }).join("&");
  return `${url}?${queryString}`;
}

const CommonUtils = {
  isNullOrUndefined,
  isNullEmptyOrUndefinedString,
  createUrlWithParams,
}

export default CommonUtils;