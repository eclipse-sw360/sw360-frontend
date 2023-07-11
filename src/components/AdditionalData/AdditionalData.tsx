// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

const AdditionalData = ({ additionalData }: any) => {
  const regexEmail = /^\w+([.-]\w+)*@\w+([.-]\w+)*(\.\w{2,3})+$/;
  const regexUrl = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/g;
  return (
    <> {
      Object.keys(additionalData).map((key) => {
        if (additionalData[key].match(regexEmail)) {
          return (
            <li key={key}>
              <span className="mapDisplayChildItemLeft" style={{ fontWeight: 'bold' }}>{key}: </span>
              <span className="mapDisplayChildItemRight"> <a style={{ textDecoration: 'none', color: '#F7941E' }} href={`mailto:${additionalData[key]}`}>{additionalData[key]}</a></span>
            </li>
          )
        }
        else if (additionalData[key].match(regexUrl)) {
          return (
            <li key={key}>
              <span className="mapDisplayChildItemLeft" style={{ fontWeight: 'bold' }}>{key}: </span>
              <span className="mapDisplayChildItemRight"> <a style={{ textDecoration: 'none', color: '#F7941E' }} href={additionalData[key]}>{additionalData[key]}</a></span>
            </li>
          )
        } else {
          return (
            <li key={key}>
              <span className="mapDisplayChildItemLeft" style={{ fontWeight: 'bold' }}>{key}: </span>
              <span className="mapDisplayChildItemRight">{additionalData[key]}</span>
            </li>
          )
        }
      })
    } </>
  )
}
export default AdditionalData;