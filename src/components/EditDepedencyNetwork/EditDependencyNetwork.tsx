// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Form, OverlayTrigger, Tooltip as BootstrapTooltip, Spinner, Button, Alert, Modal } from 'react-bootstrap'
import { ImSpinner11 } from 'react-icons/im'
import LinkedReleasesTable from './LinkedReleasesTable'
import { FaInfoCircle, FaRegTrashAlt, FaRegQuestionCircle } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'
import { useState, ReactNode, useEffect, useCallback, useRef } from 'react'
import { getSession } from 'next-auth/react'
import { ApiUtils, CommonUtils } from '@/utils/index'
import React from 'react'
import SearchReleasesModal from '../sw360/SearchReleasesModal/SearchReleasesModal'
import { Embedded, HttpStatus, ReleaseDetail, ReleaseLink, ReleaseNode, ProjectPayload } from '@/object-types'
import styles from './component.module.css'
import { useTranslations } from 'next-intl'

interface CheckCyclicLinkPayload {
    linkedToReleases?: Array<string>
    linkedReleases?: Array<string>
}

interface CheckCyclicResponse {
    message: string
    status: number
}

interface IProps {
    projectId?: string
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

const releaseRelationship = {
    UNKNOWN: 'UNKNOWN',
    CONTAINED: 'CONTAINED',
    REFERRED: 'REFERRED',
    DYNAMICALLY_LINKED: 'DYNAMICALLY_LINKED',
    STATICALLY_LINKED: 'STATICALLY_LINKED',
    SIDE_BY_SIDE: 'SIDE_BY_SIDE',
    STANDALONE: 'STANDALONE',
    INTERNAL_USE: 'INTERNAL_USE',
    OPTIONAL: 'OPTIONAL',
    TO_BE_REPLACED: 'TO_BE_REPLACED',
    CODE_SNIPPET: 'CODE_SNIPPET',
}

const mainlineStates = {
    OPEN: 'OPEN',
    MAINLINE: 'MAINLINE',
    SPECIFIC: 'SPECIFIC',
    PHASEOUT: 'PHASEOUT',
    DENIED: 'DENIED',
}

const Tooltip = ({ text, children, className }: { text: string, children: ReactNode, className?: string }) => {
    return (
        <OverlayTrigger
            placement='bottom'
            overlay={<BootstrapTooltip>{text}</BootstrapTooltip>
            }
        >
            <span className={className}>
                {children}
            </span>
        </OverlayTrigger>
    )
}

const ADD_RELEASE_MODES = {
    ROOT: 0,
    CHILDREN: 1,
}

const EditDependencyNetwork = ({ projectId, projectPayload, setProjectPayload }: IProps) => {
    const t = useTranslations('default')

    const showMessageTimeOut = useRef(undefined)
    const addReleaseMode = useRef<number | undefined>(undefined)
    const nodeToAddChildren = useRef<ReleaseNode | undefined>(undefined)
    const nodeRefToRemove = useRef<{
        removedNode: ReleaseNode,
        parentNode: ReleaseNode
    }>(undefined)
    const linkedToReleases = useRef(undefined)

    const compareSpinner = useRef(undefined);
    const [selectedReleases, setSelectedReleases] = useState<Array<ReleaseDetail>>([])
    const [network, setNetwork] = useState<Array<ReleaseNode>>(undefined)
    const [duplicatedReleases, setDuplicatedReleases] = useState<Array<string>>([])
    const [displayedCyclicLinks, setDisplayedCyclicLinks] = useState<Array<string>>([])

    const [message, setMessage] = useState({
        show: false,
        variant: 'danger'
    })
    const [showReleaseModal, setShowReleaseModal] = useState<boolean>(false)
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false)

    // Create linked release rows in table from the current network recusively
    const renderLinkedReleases = (releases: Array<ReleaseNode>, parentNode: ReleaseNode = undefined, level: number = 0, releaseIdPath: Array<string> = []) => {
        return Object.values(releases).map((release: ReleaseNode): ReactNode => {
            const pathIdToNode = [...releaseIdPath, release.releaseId]

            return <>
            {
                CommonUtils.isNullEmptyOrUndefinedString(release.releaseName) && CommonUtils.isNullEmptyOrUndefinedString(release.releaseVersion)
                ?
                <tr>
                    <td colSpan={7} style={{ paddingLeft: `${0.5 + level * 1.5}rem` }}>{t('Restricted release')}</td>
                </tr>
                :
                <tr key={release.releaseId + level}
                    className={(release.isDiff === true) ? 'node-have-diff' : ''}
                >
                    <td className='align-middle' style={{ paddingLeft: `${0.5 + level * 1.5}rem` }}>
                        {release.releaseName}
                        <Tooltip text='Add child releases' className='float-end'>
                            <FaPlus className='float-end cursor-pointer' size={20} onClick={() => addChildrenNode(release, pathIdToNode)} />
                        </Tooltip>
                    </td>
                    <td className='align-middle'>
                        <Form.Select
                            onFocus={() => fetchOtherVersionsOfRelease(release)}
                            onChange={(event) => updateReleaseOfNode(release, parentNode, releaseIdPath, event)}
                        >
                            {
                                release.otherReleaseVersions
                                    ?
                                    release.otherReleaseVersions.sort((a, b) => a.version.localeCompare(b.version)).map(rel =>
                                        <option key={rel.id} value={rel.id}
                                            selected={(rel.id === release.releaseId)}
                                            className='textlabel stackedLabel'
                                        >
                                            {rel.version}
                                        </option>
                                    )
                                    :
                                    <option value={release.releaseId} className='textlabel stackedLabel' selected>
                                        {release.releaseVersion}
                                    </option>
                            }
                        </Form.Select>
                    </td>
                    <td style={{ width: '5%' }} className='align-middle text-center'>
                        <Tooltip text={t('Load default child releases')}>
                            <ImSpinner11 size={19} className='cursor-pointer' onClick={() => loadDefaultNetwork(release)} />
                        </Tooltip>
                    </td>
                    <td className='align-middle'>
                        <Form.Select onChange={(event) => changeReleaseRelationship(release, event)} name='releaseRelationship'>
                            {
                                Object.entries(releaseRelationship).map(([key, value]: Array<string>) =>
                                    <option key={key} value={key}
                                        selected={key === release.releaseRelationship}
                                    >
                                        {t(value as never)}
                                    </option>
                                )
                            }
                        </Form.Select>
                    </td>
                    <td className='align-middle'>
                        <Form.Select onChange={(event) => changeMainlineState(release, event)} name='mainlineState'>
                            {
                                Object.entries(mainlineStates).map(([key, value]: Array<string>) =>
                                    <option key={key} value={key}
                                        selected={key === release.mainlineState}
                                    >
                                        {t(value as never)}
                                    </option>
                                )
                            }
                        </Form.Select>
                    </td>
                    <td className='align-middle'>
                        <input type='text'
                            className='form-control'
                            placeholder={t('Enter comment')}
                            defaultValue={release.comment}
                            onChange={(event) => changeComment(release, event)}
                        />
                    </td>
                    <td className='align-middle text-center'>
                        <Tooltip text={t('Delete')}>
                            <FaRegTrashAlt size={19} className='cursor-pointer' onClick={() => removeNode(parentNode, release)} />
                        </Tooltip>
                    </td>
                </tr>
                }
                {renderLinkedReleases(release.releaseLink, release, level + 1, pathIdToNode)}
            </>
        })
    }

    const addChildrenNode = (release: ReleaseNode, idPathFromRoot: Array<string>) => {
        setShowReleaseModal(true)
        nodeToAddChildren.current = release
        linkedToReleases.current = idPathFromRoot
        addReleaseMode.current = ADD_RELEASE_MODES.CHILDREN
    }

    const addRootNode = () => {
        setShowReleaseModal(true)
        addReleaseMode.current = ADD_RELEASE_MODES.ROOT
    }

    const removeNode = (parentNode: ReleaseNode, removedRelease: ReleaseNode) => {
        nodeRefToRemove.current = {
            removedNode: removedRelease,
            parentNode: parentNode,
        }
        setShowConfirmDelete(true)
    }

    const loadDefaultNetwork = async (releaseNode: ReleaseNode) => {
        const session = await getSession()
        const response = await ApiUtils.GET(`releases/${releaseNode.releaseId}/releases?transitive=true`, session.user.access_token)
        const data = await response.json() as Embedded<ReleaseLink, 'sw360:releaseLinks'>
        const defaultNetwork = (data._embedded) ? convertReleaseLinksToReleaseNodes(data._embedded['sw360:releaseLinks']) : []
        releaseNode.releaseLink = defaultNetwork
        setNetwork([...network])
        showMessage('success')
    }

    const convertReleaseLinksToReleaseNodes = (releaseLinks: Array<ReleaseLink>): Array<ReleaseNode> => {
        if (releaseLinks === undefined)
            return []
        return releaseLinks.map((rel: ReleaseLink): ReleaseNode => {
            return {
                releaseId: rel.id,
                releaseName: rel.name,
                releaseVersion: rel.version,
                releaseRelationship: 'CONTAINED',
                mainlineState: 'OPEN',
                releaseLink: (rel._embedded) ? convertReleaseLinksToReleaseNodes(rel._embedded['sw360:releaseLinks']) : [],
                comment: '',
                componentId: rel.componentId,
            }
        })
    }

    const fetchNetwork = useCallback(async () => {
        const session = await getSession()
        const response = await ApiUtils.GET(`projects/network/${projectId}/linkedReleases`, session.user.access_token)
        const data = await response.json()
        setNetwork(data)
    }, [projectId])

    const createReleaseNodeFromReleaseIds = (validSelectedReleases: Array<ReleaseDetail>, releasesInSameLevel: Array<string>) => {
        const releasesDuplicateInSameLevel = []
        const releaseNodes: Array<ReleaseNode> = []
        for (const rel of validSelectedReleases) {
            if (!releasesInSameLevel.includes(rel.id)) {
                const newNode: ReleaseNode = {
                    releaseId: rel.id,
                    releaseRelationship: 'CONTAINED',
                    mainlineState: 'OPEN',
                    comment: '',
                    releaseLink: [],
                    releaseName: rel.name,
                    releaseVersion: rel.version,
                    componentId: rel._links['sw360:component'].href.split('/').at(-1),
                }
                releaseNodes.push(newNode)
            } else {
                releasesDuplicateInSameLevel.push(`${rel.name} (${rel.version})`)
            }
        }
        if (releasesDuplicateInSameLevel.length > 0) {
            setDuplicatedReleases(releasesDuplicateInSameLevel)
            showMessage('danger')
        }
        return releaseNodes
    }

    const showMessage = (variant: string) => {
        clearTimeout(showMessageTimeOut.current)
        setMessage({
            show: true,
            variant: variant
        })
        showMessageTimeOut.current = window.setTimeout(() => {
            closeMessage()
        }, 7000);
    }

    const closeMessage = () => {
        setDuplicatedReleases([])
        setDisplayedCyclicLinks([])
        setMessage({
            ...message,
            show: false,
        })
    }

    const closeConfirmDeleteModal = () => {
        setShowConfirmDelete(false)
        nodeRefToRemove.current = undefined
    }

    const confirmToDelete = () => {
        if (nodeRefToRemove.current === undefined) {
            closeConfirmDeleteModal()
            return
        }

        const parentNode = nodeRefToRemove.current.parentNode
        const removedNode = nodeRefToRemove.current.removedNode

        if (parentNode === undefined) {
            const newNetwork = [...network].filter(rel => rel.releaseId !== removedNode.releaseId)
            setNetwork([...newNetwork])
            closeConfirmDeleteModal()
            return
        }

        parentNode.releaseLink = parentNode.releaseLink.filter((rel: ReleaseNode) => rel.releaseId !== removedNode.releaseId)
        setNetwork([...network])
        closeConfirmDeleteModal()
    }

    const changeMainlineState = (release: ReleaseNode, event: React.ChangeEvent<HTMLSelectElement>) => {
        release.mainlineState = event.target.value
        setNetwork([...network])
    }

    const changeReleaseRelationship = (release: ReleaseNode, event: React.ChangeEvent<HTMLSelectElement>) => {
        release.releaseRelationship = event.target.value
        setNetwork([...network])
    }

    const changeComment = (release: ReleaseNode, event: React.ChangeEvent<HTMLInputElement>) => {
        release.comment = event.target.value
        setNetwork([...network])
    }

    /*
        Handle change release version:
        - If changed version has cyclic link with parent and child releases => show warning message + not allow to change
        - If changed version already exists at the same level =>  show warning message + not allow to change
    */
    const updateReleaseOfNode = async (release: ReleaseNode, parentNode: ReleaseNode, releaseIdPath: Array<string>, event: React.ChangeEvent<HTMLSelectElement>) => {
        closeMessage()
        const selectedReleaseId = event.target.value
        const selectedIndex = event.target.selectedIndex
        const selectedReleaseVersion = event.target.options[selectedIndex].text

        const subNodeIdsOfCurrentNode = getSubNodeIdsOfCurrentNode(release.releaseLink)
        const cyclicLinks = await getCyclicLinks(subNodeIdsOfCurrentNode, releaseIdPath, selectedReleaseId)

        if (!CommonUtils.isNullEmptyOrUndefinedArray(cyclicLinks)) {
            setDuplicatedReleases([])
            event.target.value = release.releaseId
            setDisplayedCyclicLinks(cyclicLinks)
            showMessage('danger')
            return
        }

        setDisplayedCyclicLinks([])
        if (parentNode === undefined) {
            if (Object.values(network).map(rel => rel.releaseId).includes(selectedReleaseId)) {
                setDuplicatedReleases([`${release.releaseName} (${selectedReleaseVersion})`])
                event.target.value = release.releaseId
                showMessage('danger')
                return
            }
            release.releaseId = selectedReleaseId
            release.releaseVersion = selectedReleaseVersion
            setNetwork([...network])
        } else {
            if (Object.values(parentNode.releaseLink).map(rel => rel.releaseId).includes(selectedReleaseId)) {
                setDuplicatedReleases([`${release.releaseName} (${selectedReleaseVersion})`])
                event.target.value = release.releaseId
                showMessage('danger')
                return
            }
            release.releaseId = selectedReleaseId
            release.releaseVersion = selectedReleaseVersion
            setNetwork([...network])
        }
    }

    const getSubNodeIdsOfCurrentNode = (subNodes: Array<ReleaseNode>): Array<string> => {
        if (CommonUtils.isNullEmptyOrUndefinedArray(subNodes))
            return []
        const subNodeIds: Array<string> = []
        for (const subNode of subNodes) {
            subNodeIds.push(subNode.releaseId)
            subNodeIds.push(...getSubNodeIdsOfCurrentNode(subNode.releaseLink))
        }
        return subNodeIds
    }

    // Fetch other versions of release when clicking on select version box
    const fetchOtherVersionsOfRelease = async (release: ReleaseNode) => {
        if (!release.otherReleaseVersions === undefined) return

        const session = await getSession()
        const response = await ApiUtils.GET(`components/${release.componentId}/releases`, session.user.access_token)
        const releases = await response.json() as Embedded<ReleaseLink, 'sw360:releaseLinks'>

        const otherVersions = Object.values(releases._embedded['sw360:releaseLinks']).map(rel => {
            return {
                version: rel.version,
                id: rel.id,
            }
        })

        release.otherReleaseVersions = otherVersions

        setNetwork([...network])
    }

    const compareWithDefault = async () => {
        if (network === undefined) return

        compareSpinner.current.style.display = 'inline-block'
        const session = await getSession()
        const response = await ApiUtils.POST('projects/network/compareDefaultNetwork', network, session.user.access_token)
        const comparedNetwork = await response.json() as Array<ReleaseNode>
        setNetwork(comparedNetwork)
        compareSpinner.current.style.display = 'none'
    }

    const getCyclicLinks = async (linkedReleases: Array<string>, linkedToReleases: Array<string>, checkingReleaseId: string) => {
        const session = await getSession()
        const cyclicCheckPayload: CheckCyclicLinkPayload = {
            linkedReleases: linkedReleases,
            linkedToReleases: linkedToReleases,
        }
        const response = await ApiUtils.POST(`releases/${checkingReleaseId}/checkCyclicLink`, cyclicCheckPayload, session.user.access_token)
        const cyclicLinks: Array<string> = []
        if (response.status == HttpStatus.MULTIPLE_STATUS) {
            const data = await response.json() as Array<CheckCyclicResponse>
            for (const cyclicResponse of data) {
                if (cyclicResponse.status == HttpStatus.CONFLICT) {
                    if (!cyclicLinks.includes(cyclicResponse.message.trim())) {
                        cyclicLinks.push(cyclicResponse.message.trim())
                    }
                }
            }
        }
        return cyclicLinks
    }

    // From selected releases **selectedReleases**, ignore cyclically linked releases. Return valid releases.
    const getNotCyclicReleaseToLink = async () => {
        const validSelectedReleases: Array<ReleaseDetail> = []
        const cyclicLinks: Array<string> = []
        for (const release of selectedReleases) {
            const cyclicLinksOfRelease = await getCyclicLinks([], linkedToReleases.current, release.id)
            if (cyclicLinksOfRelease.length === 0) {
                validSelectedReleases.push(release)
            }
            cyclicLinks.push(...cyclicLinksOfRelease)
        }
        setDisplayedCyclicLinks(cyclicLinks)
        if (cyclicLinks.length > 0) {
            showMessage('danger')
        }
        return validSelectedReleases
    }

    useEffect(() => {
        if (selectedReleases.length === 0)
            return
        if (addReleaseMode.current === ADD_RELEASE_MODES.ROOT) {
            setDisplayedCyclicLinks([])
            const newReleaseNodes = createReleaseNodeFromReleaseIds(selectedReleases, network.map(rel => rel.releaseId))
            setNetwork([...network, ...newReleaseNodes])
            addReleaseMode.current = undefined
        } else {
            getNotCyclicReleaseToLink().then(validSelectedReleases => {
                const newReleaseNodes = createReleaseNodeFromReleaseIds(validSelectedReleases, nodeToAddChildren.current.releaseLink.map(rel => rel.releaseId))
                nodeToAddChildren.current.releaseLink = [...nodeToAddChildren.current.releaseLink, ...newReleaseNodes]
                setNetwork([...network])
                linkedToReleases.current = undefined
                nodeToAddChildren.current = undefined
                addReleaseMode.current = undefined
            }).catch(() => {
                linkedToReleases.current = undefined
                nodeToAddChildren.current = undefined
                addReleaseMode.current = undefined
            })
        }
        setSelectedReleases([])
    }, [selectedReleases])

    useEffect(() => {
        if (projectId === undefined) {
            setNetwork([])
            return
        }
        fetchNetwork()
    }, [projectId])

    useEffect(() => {
        setProjectPayload({
            ...projectPayload,
            dependencyNetwork: network
        })
    }, [network])

    return (
        <div className='row mb-4'>
            <div className={`${styles.title} mb-2`}>
                <h6 className='fw-bold text-uppercase'>
                    {t('Linked Releases')}
                    <hr className='my-2 mb-2' />
                </h6>
                <Button variant='outline-success' className='float-start' onClick={compareWithDefault}>
                    {t('Compare with default network')} {' '}
                    <Spinner ref={compareSpinner} className='spinner' size='sm' style={{ display: 'none' }} />
                </Button>
            </div>
            <div className='px-0'>
                {
                    network
                        ?
                        <>
                            <Alert show={message.show}
                                onClose={() => closeMessage()}
                                variant={message.variant}
                                dismissible
                                className={`${styles['message']}`}
                            >
                                <b><FaInfoCircle size={13} /> {message.variant === 'danger' ? t('Warning') : t('Success')}:</b>
                                {
                                    (message.variant === 'danger')
                                        ?
                                        <p>
                                            <>
                                                {
                                                    !CommonUtils.isNullEmptyOrUndefinedArray(duplicatedReleases)
                                                    && <div>{t('Duplicated Releases')}: <b>{duplicatedReleases.join(', ')}</b></div>
                                                }
                                            </>
                                            <>
                                                {
                                                    !CommonUtils.isNullEmptyOrUndefinedArray(displayedCyclicLinks)
                                                    && Object.values(displayedCyclicLinks)
                                                        .map(cyclicLink => <div key={cyclicLink}>{t('Cyclic Hierarchy')}: <b>{cyclicLink}</b></div>)
                                                }
                                            </>
                                        </p>
                                        :
                                        <> {t('Default network is loaded successfully')}</>
                                }
                            </Alert>
                            <LinkedReleasesTable>
                                <tbody style={{ fontSize: '1rem' }}>
                                    {
                                        renderLinkedReleases(network)
                                    }
                                </tbody>
                            </LinkedReleasesTable>
                            <Button variant='secondary' className='mt-2' onClick={() => addRootNode()}>{t('Add Releases')}</Button>
                        </>
                        :
                        <div className='col-12 text-center'>
                            <Spinner className='spinner' />
                        </div>
                }
                <SearchReleasesModal projectId={projectId} show={showReleaseModal} setShow={setShowReleaseModal} setSelectedReleases={setSelectedReleases} />
                <Modal className='modal-danger' show={showConfirmDelete} setShow={setShowConfirmDelete} backdrop='static' centered size='lg'>
                    <Modal.Header closeButton>
                        <Modal.Title><FaRegQuestionCircle /> {t('Delete link to release')}?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {
                            nodeRefToRemove.current &&
                            <p>
                                {t('Do you really want to remove the link to release')}
                                {' '}
                                <b>
                                    {`${nodeRefToRemove.current?.removedNode.releaseName} (${nodeRefToRemove.current?.removedNode.releaseVersion})`}
                                </b> ?
                            </p>
                        }
                    </Modal.Body>
                    <Modal.Footer className='justify-content-end'>
                        <Button
                            type='button'
                            data-bs-dismiss='modal'
                            variant='secondary'
                            className='me-2'
                            onClick={closeConfirmDeleteModal}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button type='button' variant='danger' onClick={confirmToDelete}>
                            {t('Delete Link')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    )
}

const compare = (prevState: IProps, nextState: IProps) => {
    return prevState.projectId === nextState.projectId
}

export default React.memo(EditDependencyNetwork, compare)
