// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ReactNode, useEffect, useState } from 'react'
import { ObligationFormProps, ObligationLevels, ObligationTypes } from '../../../../../object-types/Obligation'
import { useObligationTree } from '../hook/useObligationTree'
import ObligationHeader from './ObligationHeader'
import { ObligationTree } from './ObligationTree'

function ObligationForm({ obligation, setObligation }: ObligationFormProps): ReactNode {
    const [title, setTitle] = useState(obligation.title ?? '')
    const [obligationType, setObligationType] = useState(
        obligation.obligationType !== undefined && obligation.obligationType in ObligationTypes
            ? ObligationTypes[obligation.obligationType as keyof typeof ObligationTypes]
            : '',
    )
    const [obligationLevel, setObligationLevel] = useState(
        obligation.obligationLevel !== undefined && obligation.obligationLevel in ObligationLevels
            ? ObligationLevels[obligation.obligationLevel as keyof typeof ObligationLevels]
            : '',
    )

    const treeops = useObligationTree(obligation.text)

    useEffect(() => {
        setObligation((prev) => ({
            ...prev,
            title: title,
            node: treeops.makeNodeString(),
            text: treeops.treeText,
            obligationType:
                Object.keys(ObligationTypes).find(
                    (key) => ObligationTypes[key as keyof typeof ObligationTypes] === obligationType,
                ) ?? '',
            obligationLevel:
                Object.keys(ObligationLevels).find(
                    (key) => ObligationLevels[key as keyof typeof ObligationLevels] === obligationLevel,
                ) ?? '',
        }))
    }, [
        title,
        treeops.tree,
        obligationType,
        obligationLevel,
    ])

    return (
        <div className='obligation-container'>
            <div className='p-3'>
                <ObligationHeader
                    title={title}
                    obligationType={obligationType}
                    obligationLevel={obligationLevel}
                    onTitleChange={setTitle}
                    onTypeChange={setObligationType}
                    onLevelChange={setObligationLevel}
                />

                <ObligationTree
                    tree={treeops.tree}
                    title={title}
                    onUpdateNode={treeops.updateNode}
                    onAddChild={treeops.addChild}
                    onAddSibling={treeops.addSibling}
                    onDeleteNode={treeops.deleteNode}
                    onImportNode={treeops.importNode}
                />

                <div className='row'>
                    <div className='col-md-4'>
                        <label className='form-label fw-bold'>{'Preview'}</label>
                        <pre className='border p-3 obligation-preview'>
                            {title}
                            <br />
                            {treeops.treeText}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ObligationForm
