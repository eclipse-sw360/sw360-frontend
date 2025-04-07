// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ApiUtils, CommonUtils } from '@/utils'
import { Session } from 'next-auth'

const download = async (url: string,
                        session: Session | null,
                        fileName: string) : Promise<number | undefined> => {
    if (CommonUtils.isNullOrUndefined(session)) {
        console.error('User is undefined')
        return
    }
    try {
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (!response.ok) {
          console.error('Failed to download file:', response.status)
          return response.status
        }
        const blob = await response.blob()
        const objectURL = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objectURL
        link.setAttribute('download', fileName)
        link.click()
        setTimeout(() => window.URL.revokeObjectURL(objectURL), 0)
        return response.status
      } catch (error) {
        console.log('error', error)
        return
      }
}

const DownloadService = {
    download,
}

export default DownloadService
