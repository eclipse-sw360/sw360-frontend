// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Helio Chissini de Castro, 2023

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

const isNullOrUndefined = (obj: unknown) => {
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

const createUrlWithParams = (url: string, params: string[][]) => {
  const queryString =  new URLSearchParams(params);
  return `${url}?${queryString.toString()}`;
}

const CommonUtils = {
  isNullOrUndefined,
  isNullEmptyOrUndefinedString,
  createUrlWithParams,
}

export default CommonUtils;