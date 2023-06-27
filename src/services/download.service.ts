// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Session } from "@/object-types/Session";
import ApiUtils from "@/utils/api/api.util";

const download = (url: string, session: Session, fileName: string) => {
  ApiUtils.GET(url, session.user.access_token)
  .then((response: any) => response.blob())
  .then((blob: any) => {
      const objectURL = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectURL;
      link.setAttribute("download", fileName);
      link.click();
      setTimeout(() => window.URL.revokeObjectURL(objectURL), 0);
  }).catch(error => console.log('error', error));
}

const DownloadService = {
  download
}

export default DownloadService