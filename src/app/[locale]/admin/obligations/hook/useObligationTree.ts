// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useEffect, useState } from 'react'
import { ObligationElement, TreeNode } from '../../../../../object-types/Obligation'

interface ObligationTreeReturn {
    tree: TreeNode[]
    treeText: string
    addChild: (parentId?: string) => void
    addSibling: (nodeId: string, parentId?: string) => void
    deleteNode: (nodeId: string, parentId?: string) => void
    updateNode: (
        nodeId: string,
        field: 'type' | 'text' | 'languageElement' | 'action' | 'object',
        value: string,
    ) => void
    updateNodeElement: (nodeId: string, element: ObligationElement) => void
}

export function useObligationTree(initialText?: string): ObligationTreeReturn {
    const [tree, setTree] = useState<TreeNode[]>([])
    const [treeText, setTreeText] = useState(initialText ?? '')
    const generateId = () => Math.random().toString(36).substring(2, 11)
    const getTreeAsText = (nodes: TreeNode[], level = 0): string => {
        let result = ''
        nodes.forEach((node, index) => {
            const indent = level > 0 ? '\t'.repeat(level) : ''
            let nodeText = ''
            if (node.languageElement != null) {
                nodeText = `${node.languageElement} ${node.action} ${node.object}`.trim()
            } else {
                nodeText = `${node.type} ${node.text}`.trim()
            }
            result += index === 0 && level === 0 ? nodeText : `\n${indent}${nodeText}`
            if (node.children.length > 0) {
                result += getTreeAsText(node.children, level + 1)
            }
        })
        return result
    }

    const addChild = (parentId?: string) => {
        const newNode: TreeNode = {
            id: generateId(),
            type: '',
            text: '',
            children: [],
            parentId,
        }
        const updatedTree =
            parentId != null
                ? tree.map((node) =>
                      node.id === parentId
                          ? { ...node, children: [...node.children, newNode] }
                          : { ...node, children: updateChildren(node.children, parentId, newNode) },
                  )
                : [...tree, newNode]
        setTree(updatedTree)
        setTreeText(getTreeAsText(updatedTree))
    }

    const updateChildren = (children: TreeNode[], parentId: string, newNode: TreeNode): TreeNode[] => {
        return children.map((child) =>
            child.id === parentId
                ? { ...child, children: [...child.children, newNode] }
                : { ...child, children: updateChildren(child.children, parentId, newNode) },
        )
    }

    const addSibling = (nodeId: string, parentId?: string) => {
        const newNode: TreeNode = {
            id: generateId(),
            type: '',
            text: '',
            children: [],
            parentId,
        }
        const updatedTree =
            parentId != null
                ? tree.map((node) =>
                      node.id === parentId
                          ? { ...node, children: [...node.children, newNode] }
                          : { ...node, children: updateChildren(node.children, parentId, newNode) },
                  )
                : [...tree, newNode]
        setTree(updatedTree)
        setTreeText(getTreeAsText(updatedTree))
    }

    const deleteNode = (nodeId: string, parentId?: string) => {
        const updatedTree =
            parentId != null
                ? tree.map((node) =>
                      node.id === parentId
                          ? { ...node, children: node.children.filter((child) => child.id !== nodeId) }
                          : { ...node, children: deleteFromChildren(node.children, nodeId) },
                  )
                : tree.filter((node) => node.id !== nodeId)
        setTree(updatedTree)
        setTreeText(getTreeAsText(updatedTree))
    }

    const deleteFromChildren = (children: TreeNode[], nodeId: string): TreeNode[] => {
        return children
            .map((child) => ({
                ...child,
                children: deleteFromChildren(child.children, nodeId),
            }))
            .filter((child) => child.id !== nodeId)
    }

    const updateNode = (
        nodeId: string,
        field: 'type' | 'text' | 'languageElement' | 'action' | 'object',
        value: string,
    ) => {
        const updateNodeInTree = (nodes: TreeNode[]): TreeNode[] => {
            return nodes.map((node) => {
                if (node.id === nodeId) {
                    return { ...node, [field]: value }
                }
                return { ...node, children: updateNodeInTree(node.children) }
            })
        }
        const updatedTree = updateNodeInTree(tree)
        setTree(updatedTree)
        setTreeText(getTreeAsText(updatedTree))
    }

    const updateNodeElement = (nodeId: string, element: ObligationElement) => {
        const updateNodeInTree = (nodes: TreeNode[]): TreeNode[] => {
            return nodes.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        ['languageElement']: element.languageElement,
                        ['action']: element.action,
                        ['object']: element.object,
                    }
                }
                return { ...node, children: updateNodeInTree(node.children) }
            })
        }
        const updatedTree = updateNodeInTree(tree)
        setTree(updatedTree)
        setTreeText(getTreeAsText(updatedTree))
    }

    const parseTextToTree = (text: string): TreeNode[] => {
        if (!text.trim()) return []

        const lines = text.split('\n')
        const rootNodes: TreeNode[] = []
        const nodeMap: Record<string, TreeNode> = {}

        lines.forEach((line) => {
            const indentLevel = line.search(/\S|$/) / 4
            const trimmedLine = line.trim()
            if (!trimmedLine) return

            const parts = trimmedLine.split(' ')
            let newNode: TreeNode

            if (parts.length >= 3) {
                const imperatives = ['YOU MUST', 'YOU MUST NOT', 'YOU MAY', 'YOU SHOULD']
                const foundImperative = imperatives.find((imp) => trimmedLine.toUpperCase().startsWith(imp))

                if (foundImperative != undefined) {
                    const remainingText = trimmedLine.substring(foundImperative.length).trim()
                    const [action = '', ...objectParts] = remainingText ? remainingText.split(' ') : ['']
                    newNode = {
                        id: generateId(),
                        type: '',
                        text: '',
                        children: [],
                        languageElement: foundImperative,
                        action: action,
                        object: objectParts.join(' '),
                    }
                } else {
                    const spaceIndex = trimmedLine.indexOf(' ')
                    const type = spaceIndex > 0 ? trimmedLine.substring(0, spaceIndex) : ''
                    const text = spaceIndex > 0 ? trimmedLine.substring(spaceIndex + 1) : trimmedLine
                    newNode = {
                        id: generateId(),
                        type,
                        text,
                        children: [],
                    }
                }
            } else {
                const spaceIndex = trimmedLine.indexOf(' ')
                const type = spaceIndex > 0 ? trimmedLine.substring(0, spaceIndex) : ''
                const text = spaceIndex > 0 ? trimmedLine.substring(spaceIndex + 1) : trimmedLine
                newNode = {
                    id: generateId(),
                    type,
                    text,
                    children: [],
                }
            }

            if (indentLevel === 0) {
                rootNodes.push(newNode)
                nodeMap[newNode.id] = newNode
            } else {
                const parentIndices = Object.keys(nodeMap).filter(
                    (id) =>
                        nodeMap[id].children.length === 0 ||
                        !nodeMap[id].children.some((child) => nodeMap[child.id].children.length === 0),
                )

                if (parentIndices.length > 0) {
                    const parentId = parentIndices[parentIndices.length - 1]
                    newNode.parentId = parentId
                    nodeMap[parentId].children.push(newNode)
                    nodeMap[newNode.id] = newNode
                }
            }
        })

        return rootNodes
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
        updateNodeElement,
    }
}
