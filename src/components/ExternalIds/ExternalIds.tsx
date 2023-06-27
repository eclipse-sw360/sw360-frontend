// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

const ExternalIds = ({ externalIds }: any) => {
  return (
    <> {
      Object.keys(externalIds).map((key) => {
        return (
          <li key={key}>
            <span className="mapDisplayChildItemLeft" style={{ fontWeight: 'bold' }}>{key}: </span>
            <span className="mapDisplayChildItemRight"> {externalIds[key]}</span>
          </li>
        )
      }
      )}
    </>
  )
}
export default ExternalIds;