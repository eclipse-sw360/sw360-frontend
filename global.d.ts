// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// Ambient declarations for static asset imports (*.svg, *.png, *.jpg, ...).
// Next.js normally provides these via the auto-generated, git-ignored
// `next-env.d.ts`, which only exists after `next dev` / `next build`. The
// standalone `type-check` step (tsgo) runs before the build in CI, so we
// reference Next's image types directly here to keep type-checking independent
// of the build step (reusing the exact same declarations avoids type drift).
/// <reference types="next/image-types/global" />

type Messages = typeof import('./messages/en.json')
declare interface IntlMessages extends Messages {}

import { RowData } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  interface Row<TData extends RowData> {
    meta?: {
      isFullSpanRow?: boolean
    }
  }

  interface TableMeta<TData extends RowData> {
    rowHeightConstant?: boolean
  }
}
