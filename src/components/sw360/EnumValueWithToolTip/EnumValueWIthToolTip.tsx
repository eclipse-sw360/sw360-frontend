// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Tooltip, OverlayTrigger } from 'react-bootstrap'

const MainlineStates: { [k: string]: string } = {
    'OPEN': 'mainline_state_open_tooltip',
    'MAINLINE': 'mainline_state_mainline_tooltip',
    'SPECIFIC': 'mainline_state_specific_tooltip',
    'PHASEOUT': 'mainline_state_phaseout_tooltip',
    'DENIED': 'mainline_state_denied_tooltip'
}

const ReleaseRelations: { [k: string]: string } = {
    'UNKNOWN': 'release_relation_unknown_tooltip',
    'CONTAINED': 'release_relation_contained_tooltip',
    'REFERRED': 'release_relation_referred_tooltip',
    'DYNAMICALLY_LINKED': 'release_relation_dynamic_linked_tooltip',
    'STATICALLY_LINKED': 'release_relation_static_linked_tooltip',
    'SIDE_BY_SIDE': 'release_relation_side_by_side_tooltip',
    'STANDALONE': 'release_relation_standalone_tooltip',
    'INTERNAL_USE': 'release_relation_interal_use_tooltip',
    'OPTIONAL': 'release_relation_optional_tooltip',
    'TO_BE_REPLACED': 'release_relation_to_be_replaced_tooltip',
    'CODE_SNIPPET': 'release_relation_code_snippest_tooltip',
}

const EnumValues: { [k: string]: string } = {
    ...MainlineStates,
    ...ReleaseRelations,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EnumValueWithToolTip = ({ value, t }: { value: string, t: any }) : JSX.Element => {

    return (
        <OverlayTrigger
            overlay={
                <Tooltip>{t(EnumValues[value] as never)}</Tooltip>
            }
        >
            <span>
                {t(value as never)}
            </span>
        </OverlayTrigger>
    )
}

export default EnumValueWithToolTip