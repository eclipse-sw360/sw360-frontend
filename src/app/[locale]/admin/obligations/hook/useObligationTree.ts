// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useEffect, useState } from 'react'
import CommonUtils from '@/utils/common.utils'
import { TreeNode, TreeNodeVal } from '../../../../../object-types/Obligation'

interface ObligationTreeReturn {
    tree: TreeNode
    treeText: string
    addChild: (type: number, parentId: string) => void
    addSibling: (type: number, nodeId: string) => void
    deleteNode: (nodeId: string, parentId?: string) => void
    updateNode: (nodeId: string, newValue: TreeNodeVal) => void
    importNode: (nodeId: string, newValue: TreeNodeVal) => void
    makeNodeString: () => string
}

export function useObligationTree(initialText?: string): ObligationTreeReturn {
    const generateId = () => Math.random().toString(36).substring(2, 11)
    const [tree, setTree] = useState<TreeNode>({
        id: generateId(),
        val: [
            'ROOT',
        ],
        children: [],
    })
    const [treeText, setTreeText] = useState(initialText ?? '')
    const getTreeAsText = (root: TreeNode, level = 0): string => {
        let result = ''
        const indent = level > 0 ? '\t'.repeat(level) : ''
        let nodeText = ''
        if (root.val.length === 4) {
            nodeText = `${root.val[1]} ${root.val[2]} ${root.val[3]}`.trim()
        } else if (root.val.length === 2) {
            nodeText = `${root.val[0]} ${root.val[1]}`.trim()
        }
        result += level === 0 ? nodeText : `\n${indent}${nodeText}`
        root.children.forEach((node) => {
            result += getTreeAsText(node, level + 1)
        })
        return result
    }

    const removeIds = (root: TreeNode) => {
        delete root['id']
        for (const n of root.children) {
            removeIds(n)
        }
    }

    const makeNodeString = (): string => {
        const deepCopy = structuredClone(tree)
        removeIds(deepCopy)
        return JSON.stringify(deepCopy)
    }
    const _addChild = (root: TreeNode, type: number, parentId: string) => {
        if (root.id === parentId) {
            const newNode: TreeNode = {
                id: generateId(),
                val:
                    type === 0
                        ? [
                              'ROOT',
                          ]
                        : type === 1
                          ? [
                                '',
                                '',
                            ]
                          : [
                                'Obligation',
                                '',
                                '',
                                '',
                            ],
                children: [],
            }
            root.children.push(newNode)
        } else {
            for (const n of root.children) {
                _addChild(n, type, parentId)
            }
        }
    }

    const addChild = (type: number, parentId: string) => {
        const deepCopy = structuredClone(tree)
        _addChild(deepCopy, type, parentId)
        setTree(deepCopy)
        setTreeText(getTreeAsText(deepCopy))
    }

    const _addSibling = (root: TreeNode, type: number, nodeId: string, newValue?: TreeNodeVal) => {
        const targetIndex = root.children.findIndex((n) => n.id === nodeId)
        if (targetIndex !== -1) {
            const val: TreeNodeVal = CommonUtils.isNullEmptyOrUndefinedArray(newValue)
                ? type === 0
                    ? [
                          'ROOT',
                      ]
                    : type === 1
                      ? [
                            '',
                            '',
                        ]
                      : [
                            'Obligation',
                            '',
                            '',
                            '',
                        ]
                : newValue
            const newNode: TreeNode = {
                id: generateId(),
                val,
                children: [],
            }
            root.children.splice(targetIndex + 1, 0, newNode)
        } else {
            for (const n of root.children) {
                _addSibling(n, type, nodeId, newValue)
            }
        }
    }

    const addSibling = (type: number, nodeId: string) => {
        const deepCopy = structuredClone(tree)
        _addSibling(deepCopy, type, nodeId)
        setTree(deepCopy)
        setTreeText(getTreeAsText(deepCopy))
    }

    const _deleteNode = (root: TreeNode, nodeId: string) => {
        let found = false
        for (const n of root.children) {
            if (n.id === nodeId) {
                found = true
                break
            }
        }
        if (found) {
            root.children = root.children.filter((n) => n.id !== nodeId)
        } else {
            for (const n of root.children) {
                _deleteNode(n, nodeId)
            }
        }
    }

    const deleteNode = (nodeId: string) => {
        const deepCopy = structuredClone(tree)
        _deleteNode(deepCopy, nodeId)
        setTree(deepCopy)
        setTreeText(getTreeAsText(deepCopy))
    }

    const _updateNode = (root: TreeNode, nodeId: string, newValue: TreeNodeVal) => {
        if (root.id === nodeId) {
            root.val = newValue
        } else {
            for (const n of root.children) {
                _updateNode(n, nodeId, newValue)
            }
        }
    }

    const updateNode = (nodeId: string, newValue: TreeNodeVal) => {
        const deepCopy = structuredClone(tree)
        _updateNode(deepCopy, nodeId, newValue)
        setTree(deepCopy)
        setTreeText(getTreeAsText(deepCopy))
    }

    const importNode = (nodeId: string, newValue: TreeNodeVal) => {
        const deepCopy = structuredClone(tree)
        _addSibling(deepCopy, newValue.length - 1, nodeId, newValue)
        setTree(deepCopy)
        setTreeText(getTreeAsText(deepCopy))
    }

    const parseTextToTree = (text: string): TreeNode => {
        const root: TreeNode = {
            id: generateId(),
            val: [
                'ROOT',
            ],
            children: [],
        }
        if (!text.trim()) return root

        const lines = text.split('\n')
        const nodeStack: Array<{
            node: TreeNode
            indentLevel: number
        }> = []

        lines.forEach((line) => {
            const indentLevel = line.search(/\S|$/) / 4
            const trimmedLine = line.trim()
            if (!trimmedLine) return

            const parts = trimmedLine.split(' ')
            let newNode: TreeNode
            if (parts.length >= 3) {
                const imperatives = [
                    'YOU MUST',
                    'YOU MUST NOT',
                    'YOU MAY',
                    'YOU SHOULD',
                ]
                const foundImperative = imperatives.find((imp) => trimmedLine.toUpperCase().startsWith(imp))

                if (foundImperative != undefined) {
                    const remainingText = trimmedLine.substring(foundImperative.length).trim()
                    const [action = '', ...objectParts] = remainingText
                        ? remainingText.split(' ')
                        : [
                              '',
                          ]
                    newNode = {
                        id: generateId(),
                        val: [
                            'Obligation',
                            foundImperative,
                            action,
                            objectParts.join(' '),
                        ],
                        children: [],
                    }
                } else {
                    const spaceIndex = trimmedLine.indexOf(' ')
                    const type = spaceIndex > 0 ? trimmedLine.substring(0, spaceIndex) : ''
                    const text = spaceIndex > 0 ? trimmedLine.substring(spaceIndex + 1) : trimmedLine
                    newNode = {
                        id: generateId(),
                        val: [
                            type,
                            text,
                        ],
                        children: [],
                    }
                }
            } else {
                const spaceIndex = trimmedLine.indexOf(' ')
                const type = spaceIndex > 0 ? trimmedLine.substring(0, spaceIndex) : ''
                const text = spaceIndex > 0 ? trimmedLine.substring(spaceIndex + 1) : trimmedLine
                newNode = {
                    id: generateId(),
                    val: [
                        type,
                        text,
                    ],
                    children: [],
                }
            }

            // Pop stack until we find parent at indentLevel - 1
            while (nodeStack.length > 0 && nodeStack[nodeStack.length - 1].indentLevel >= indentLevel) {
                nodeStack.pop()
            }

            if (indentLevel === 0) {
                root.children.push(newNode)
            } else if (nodeStack.length > 0) {
                const parent = nodeStack[nodeStack.length - 1].node
                parent.children.push(newNode)
            } else {
                // No parent found at this indent level, add to root as fallback
                root.children.push(newNode)
            }

            nodeStack.push({
                node: newNode,
                indentLevel,
            })
        })
        return root
    }

    useEffect(() => {
        if (initialText !== undefined) {
            const parsedTree = parseTextToTree(initialText)
            setTree(parsedTree)
        }
    }, [])

    return {
        tree,
        treeText,
        addChild,
        addSibling,
        deleteNode,
        updateNode,
        importNode,
        makeNodeString,
    }
}
