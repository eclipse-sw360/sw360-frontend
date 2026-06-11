// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { ReactNode, useState } from 'react'
import { ObligationElement, ObligationTreeProps, TreeNode } from '../../../../../object-types/Obligation'
import ImportElementDialog from './ImportElementDialog'

export function ObligationTree({
    tree,
    title,
    onUpdateNode,
    onAddChild,
    onAddSibling,
    onDeleteNode,
    onImportNode,
}: ObligationTreeProps): ReactNode {
    const t = useTranslations('default')
    const [showImportElement, setShowImportElement] = useState(false)
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

    const handleImportElement = (element: ObligationElement, nodeId: string) => {
        const langElement = element.langElement ?? ''
        const action = element.action ?? ''
        const object = element.object ?? ''
        onImportNode(nodeId, [
            'Obligation',
            langElement,
            action,
            object,
        ])
        setShowImportElement(false)
    }

    const renderTree = (root: TreeNode) => {
        return root.children.map((node) => {
            return (
                <div
                    key={node.id}
                    className='tree-row ms-5'
                >
                    {node.val.length === 4 ? (
                        <div className='row mb-2 align-items-center position-relative'>
                            <div className='col-md-3'>
                                <input
                                    type='text'
                                    className='form-control'
                                    value={node.val[1]}
                                    onChange={(e) => {
                                        e.preventDefault()
                                        const action = node.val[2] ?? ''
                                        const object = node.val[3] ?? ''
                                        onUpdateNode(node.id ?? '', [
                                            'Obligation',
                                            e.target.value,
                                            action,
                                            object,
                                        ])
                                    }}
                                />
                            </div>
                            <div className='col-md-3'>
                                <input
                                    type='text'
                                    className='form-control'
                                    value={node.val[2]}
                                    onChange={(e) => {
                                        e.preventDefault()
                                        const languageElement = node.val[1] ?? ''
                                        const object = node.val[3] ?? ''
                                        onUpdateNode(node.id ?? '', [
                                            'Obligation',
                                            languageElement,
                                            e.target.value,
                                            object,
                                        ])
                                    }}
                                />
                            </div>
                            <div className='col-md-3'>
                                <input
                                    type='text'
                                    className='form-control'
                                    value={node.val[3]}
                                    onChange={(e) => {
                                        e.preventDefault()
                                        const languageElement = node.val[1] ?? ''
                                        const action = node.val[2] ?? ''
                                        onUpdateNode(node.id ?? '', [
                                            'Obligation',
                                            languageElement,
                                            action,
                                            e.target.value,
                                        ])
                                    }}
                                />
                            </div>
                            <div className='col-md-3 d-flex align-items-center action-buttons opacity-0'>
                                <span>»</span>
                                <a
                                    href='#'
                                    className='mx-2'
                                    style={{
                                        color: 'blue',
                                        textDecoration: 'none',
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onAddChild(1, node.id ?? '')
                                    }}
                                >
                                    +Child
                                </a>
                                <span>|</span>
                                <a
                                    href='#'
                                    className='mx-2'
                                    style={{
                                        color: 'blue',
                                        textDecoration: 'none',
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onAddSibling(1, node.id ?? '')
                                    }}
                                >
                                    +Sibling
                                </a>
                                <span>|</span>
                                <a
                                    href='#'
                                    className='mx-2'
                                    style={{
                                        color: 'blue',
                                        textDecoration: 'none',
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onDeleteNode(node.id ?? '')
                                    }}
                                >
                                    Delete
                                </a>
                                <span>|</span>
                                <a
                                    href='#'
                                    className='mx-2'
                                    style={{
                                        color: 'blue',
                                        textDecoration: 'none',
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setSelectedNodeId(node.id ?? '')
                                        setShowImportElement(true)
                                    }}
                                >
                                    Import
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className='row mb-2 align-items-center position-relative'>
                            <div className='col-md-3'>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder={t('Type')}
                                    value={node.val[0]}
                                    onChange={(e) => {
                                        e.preventDefault()
                                        const text = node.val[1] ?? ''
                                        onUpdateNode(node.id ?? '', [
                                            e.target.value,
                                            text,
                                        ])
                                    }}
                                />
                            </div>
                            <div className='col-md-3'>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder={t('Text')}
                                    value={node.val[1]}
                                    onChange={(e) => {
                                        e.preventDefault()
                                        const type = node.val[0] ?? ''
                                        onUpdateNode(node.id ?? '', [
                                            type,
                                            e.target.value,
                                        ])
                                    }}
                                />
                            </div>
                            <div className='col-md-3 d-flex align-items-center action-buttons opacity-0'>
                                <span>»</span>
                                <a
                                    href='#'
                                    className='mx-2'
                                    style={{
                                        color: 'blue',
                                        textDecoration: 'none',
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onAddChild(1, node.id ?? '')
                                    }}
                                >
                                    +Child
                                </a>
                                <span>|</span>
                                <a
                                    href='#'
                                    className='mx-2'
                                    style={{
                                        color: 'blue',
                                        textDecoration: 'none',
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onAddSibling(1, node.id ?? '')
                                    }}
                                >
                                    +Sibling
                                </a>
                                <span>|</span>
                                <a
                                    href='#'
                                    className='mx-2'
                                    style={{
                                        color: 'blue',
                                        textDecoration: 'none',
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        onDeleteNode(node.id ?? '')
                                    }}
                                >
                                    Delete
                                </a>
                                <span>|</span>
                                <a
                                    href='#'
                                    className='mx-2'
                                    style={{
                                        color: 'blue',
                                        textDecoration: 'none',
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setSelectedNodeId(node.id ?? '')
                                        setShowImportElement(true)
                                    }}
                                >
                                    Import
                                </a>
                            </div>
                        </div>
                    )}
                    {renderTree(node)}
                </div>
            )
        })
    }

    return (
        <>
            <ImportElementDialog
                show={showImportElement}
                setShow={setShowImportElement}
                onImport={(element) => {
                    if (selectedNodeId != null) {
                        handleImportElement(element, selectedNodeId)
                    }
                }}
            />
            <div className='col-12'>
                <label className='form-label fw-bold'>{t('Text')}</label>
                <div className='row mb-2 align-items-center'>
                    <div className='col-md-4'>
                        <input
                            type='text'
                            className='form-control'
                            id='textTitle'
                            placeholder={t('Title')}
                            disabled
                            value={title}
                        />
                    </div>
                    <div className='col-md-2'>
                        <span>» </span>
                        <a
                            href='#'
                            onClick={(e) => {
                                e.preventDefault()
                                onAddChild(1, tree.id ?? '')
                            }}
                            style={{
                                color: 'blue',
                                textDecoration: 'none',
                            }}
                        >
                            +{t('Child')}
                        </a>
                    </div>
                </div>
                {renderTree(tree)}
            </div>
        </>
    )
}
