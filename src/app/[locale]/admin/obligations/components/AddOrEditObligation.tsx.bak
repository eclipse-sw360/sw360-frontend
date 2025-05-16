// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import  ObligationHeader  from './ObligationHeader'
import { ObligationTree } from './ObligationTree'
import { useObligationTree } from '../hook/useObligationTree'
import { useState, useEffect, ReactNode } from 'react'
import { ObligationFormProps, ObligationTypes, ObligationLevels } from '../../../../../object-types/Obligation'

function ObligationForm({ obligation, setObligation }: ObligationFormProps) : ReactNode{
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

    const { tree, treeText, addChild, addSibling, deleteNode, updateNode, updateNodeElement } = 
        useObligationTree(obligation.text)

    useEffect(() => {
        setObligation((prev) => ({
            ...prev,
            title: title,
            text: treeText,
            obligationType: Object.keys(ObligationTypes).find(
                (key) => ObligationTypes[key as keyof typeof ObligationTypes] === obligationType,
            ) ?? '',
            obligationLevel: Object.keys(ObligationLevels).find(
                (key) => ObligationLevels[key as keyof typeof ObligationLevels] === obligationLevel,
            ) ?? '',
        }))
    }, [title, treeText, obligationType, obligationLevel, setObligation])

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
                    tree={tree}
                    title={title}
                    onUpdateNode={updateNode}
                    onAddChild={addChild}
                    onAddSibling={addSibling}
                    onDeleteNode={deleteNode}
                    onUpdateNodeElement={updateNodeElement}
                />

                <div className='row' style={{ marginBottom: '10px' }}>
                    <div className='col-md-4'>
                        <label className='form-label' style={{ fontWeight: 'bold' }}>
                            {'Preview'}
                        </label>
                        <div
                            className='border p-3'
                            style={{ minHeight: '100px', backgroundColor: '#f8f9fa', whiteSpace: 'pre-wrap' }}
                        >
                            {title}
                            <br />
                            {treeText}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ObligationForm
