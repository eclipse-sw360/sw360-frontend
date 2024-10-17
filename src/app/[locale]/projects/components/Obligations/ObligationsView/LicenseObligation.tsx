// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Dispatch, SetStateAction, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Table, _ } from '@/components/sw360'
import { LicenseObligationRelease, ActionType, ProjectObligation } from '@/object-types'
import { useSession, getSession } from 'next-auth/react'
import { BsCaretDownFill, BsCaretRightFill } from 'react-icons/bs'
import { Modal } from 'react-bootstrap'
import { ApiUtils } from '@/utils'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

function ExpandableList({ previewString, releases, commonReleases }: { previewString: string, releases: LicenseObligationRelease[], commonReleases: any }) {
    const [isExpanded, setExpanded] = useState(false)
    return (
        <>
            {
                isExpanded ?
                    <div>
                        <span><BsCaretDownFill onClick={() => setExpanded(false)} />{' '}</span>
                        {releases.map((release: LicenseObligationRelease, index: number) => {
                            const isCommon = commonReleases.some((commonRelease: any) => commonRelease.name === release.name && commonRelease.version === release.version);
                            return (
                                <li key={release.id ?? ''} style={{ display: 'inline' }}>
                                    <Link href={`/components/releases/detail/${release.id ?? ''}`} className='text-link' style={{ color: isCommon ? 'green' : 'neon carrot' }}>
                                        {`${release.name ?? ''} ${release.version ?? ''}`}
                                    </Link>
                                    {index >= releases.length - 1 ? '' : ', '}{' '}
                                </li>
                            )
                        })}
                    </div> :
                    <div>
                        {
                            releases.length !== 0 &&
                            <div><BsCaretRightFill onClick={() => setExpanded(true)} />{' '}{previewString}</div>
                        }
                    </div>
            }
        </>
    )
}

function ShowObligationTextOnExpand({ id, infoText, colLength }: { id: string, infoText: string, colLength: number }): JSX.Element {
    const [isExpanded, setIsExpanded] = useState(false)
    useEffect(() => {
        if (isExpanded) {
            const el = document.getElementById(id)
            const par = el.parentElement.parentElement.parentElement
            const tr = document.createElement('tr')
            tr.id = `${id}_text`
            const td = document.createElement('td')
            td.colSpan = colLength
            const licenseObligationText = document.createElement('p')
            licenseObligationText.style.whiteSpace = 'pre-line'
            licenseObligationText.textContent = infoText
            licenseObligationText.className = 'ps-5 pt-2 pe-3'
            td.appendChild(licenseObligationText)
            tr.appendChild(td)
            par.parentNode.insertBefore(tr, par.nextSibling)
        }
        else {
            const el = document.getElementById(`${id}_text`)
            if (el) {
                el.remove()
            }
        }
    }, [isExpanded])

    return (
        <>
            {
                isExpanded
                    ? <BsCaretDownFill color='gray' id={id} onClick={() => setIsExpanded(!isExpanded)} />
                    : <BsCaretRightFill color='gray' id={id} onClick={() => setIsExpanded(!isExpanded)} />
            }
        </>
    )
}

interface UpdateCommentModalMetadata {
    obligation: string
    comment: string
}

function UpdateCommentModal({ modalMetaData, setModalMetaData, payload, setPayload }: {
    modalMetaData: UpdateCommentModalMetadata,
    setModalMetaData: Dispatch<SetStateAction<UpdateCommentModalMetadata>>, payload: ProjectObligation, setPayload: Dispatch<SetStateAction<ProjectObligation>>
}) {
    const t = useTranslations('default')
    const [commentText, setCommentText] = useState('')
    useEffect(() => {
        setCommentText(modalMetaData?.comment ?? '')
    }, [modalMetaData])
    return (
        <Modal show={modalMetaData ? true : false} onHide={() => {
            setModalMetaData(null)
            setCommentText('')
        }} backdrop='static' centered size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>{t('Enter obligation comment')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <input
                    type='text'
                    value={commentText}
                    onChange={(e) => { setCommentText(e.target.value) }}
                    className='form-control'
                    placeholder={t('Enter obligation comment')}
                />
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <button
                    type='button'
                    className="fw-bold btn btn-light me-2"
                    onClick={() => {
                        setModalMetaData(null)
                        setCommentText('')
                    }}
                >
                    {t('Cancel')}
                </button>
                <button
                    type='button'
                    className="fw-bold btn btn-primary me-2"
                    onClick={() => {
                        setModalMetaData(null)
                        let obligationValue = payload?.[modalMetaData.obligation] ?? {}
                        obligationValue = { ...obligationValue, comment: commentText }
                        setPayload((payload: ProjectObligation) => ({ ...payload, [modalMetaData.obligation]: obligationValue }))
                        setCommentText('')
                    }}
                >
                    {t('Update')}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default function LicenseObligation({ projectId, actionType, payload, setPayload, selectedProjectId }:
    { projectId: string, actionType: ActionType, payload?: ProjectObligation, setPayload?: Dispatch<SetStateAction<ProjectObligation>>, selectedProjectId: string | null}) {
    const t = useTranslations('default')
    const { status } = useSession()
    const [tableData, setTableData] = useState<any[]>([])
    const [updateCommentModalData, setUpdateCommentModalData] = useState<UpdateCommentModalMetadata | null>(null)
    const [projectLicenseOligations, setProjectLicenseObligations] = useState<null | any>(null)
    const [selectedProjectLicenseOligations, setSelectedProjectLicenseObligations] = useState<null | any>(null)
    let columns;
    if (actionType === ActionType.DETAIL) {
        columns = [
            {
                id: 'licenseObligation.expand',
                formatter: ({ id, infoText }: { id: string, infoText: string }) =>
                    _(
                        <>
                            <ShowObligationTextOnExpand id={id} infoText={infoText} colLength={columns.length} />
                        </>
                    ),
                width: '4%'
            },
            {
                id: 'licenseObligation.licenseObligation',
                name: t('License Obligation'),
                formatter: ({ oblTitle }: { oblTitle: string }) =>
                    _(
                        <>
                            <div className='text-center'>
                                <span >{oblTitle}</span>
                            </div>
                        </>
                    ),
                sort: true,
            },
            {
                id: 'licenseObligation.licenses',
                name: t('Licenses'),
                formatter: (licenseIds: string[]) =>
                    _(
                        <div className='text-center'>
                            {
                                <ul className='px-0'>
                                    {licenseIds.map((licenseId: string, index: number) => {
                                        return (
                                            <li key={licenseId} style={{ display: 'inline' }}>
                                                <Link href={`/licenses/${licenseId}`} className='text-link'>
                                                    {licenseId}
                                                </Link>
                                                {index >= licenseIds.length - 1 ? '' : ', '}{' '}
                                            </li>
                                        )
                                    })}
                                </ul>
                            }
                        </div>
                    ),
                sort: true,
            },
            {
                id: 'licenseObligation.releases',
                name: t('Releases'),
                formatter: ({ releases }: { releases: LicenseObligationRelease[]}) =>
                    _(<>{
                        Array.isArray(releases) && releases.length > 0 ? (
                            <ExpandableList releases={releases} previewString={releases.map((r) => `${r.name ?? ''} ${r.version ?? ''}`).join(', ').substring(0, 10)} commonReleases={[]} />
                        ) : null
                    }</>),
                sort: true,
            },
            {
                id: 'licenseObligation.status',
                name: t('Status'),
                formatter: ({ status }: { status: string }) => {
                    return _(
                        <>{Capitalize(status ?? '')}</>
                    )
                },
                sort: true,
            },
            {
                id: 'licenseObligation.type',
                name: t('Type'),
                sort: true,
            },
            {
                id: 'licenseObligation.id',
                name: t('Id'),
                sort: true,
            },
            {
                id: 'licenseObligation.comment',
                name: t('Comment'),
                formatter: ({ comment }: { comment: string }) =>
                    _(
                        <p>{comment}</p>
                    ),
                sort: true,
            }
        ]
    } else if (actionType === ActionType.EDIT) {
        columns = [
            {
                id: 'licenseObligation.expand',
                formatter: (param: { id?: string; infoText?: string }) => {
                    const { id, infoText } = param || {};
                    return _(<>{
                        id && infoText ? (
                            <ShowObligationTextOnExpand id={id} infoText={infoText} colLength={columns.length} />
                        ) : ""
                    }</>)
                },
                width: '4%'
            },
            {
                id: 'licenseObligation.licenseObligation',
                name: t('License Obligation'),
                formatter: ({ oblTitle, oblStatus, oblComment, match }: { oblTitle: string, oblStatus: string, oblComment: string, match: boolean }) =>
                    _(
                        <>
                            <div className='text-center'>
                                <OverlayTrigger
                                    overlay={
                                        selectedProjectId ? (
                                            <Tooltip>
                                                {`${t('Status')}: ${oblStatus}`}
                                                <br />
                                                {`${t('Comment')}: ${oblComment}`}
                                            </Tooltip>
                                        ) : <></>
                                    }
                                >
                                    <span style={{ color: match ? 'green' : 'inherit' }}>{oblTitle}</span>
                                </OverlayTrigger>
                            </div>
                        </>
                    ),
                sort: true,
            },
            {
                id: 'licenseObligation.licenses',
                name: t('Licenses'),
                formatter: (licenseIds: string[]) =>
                    _(<>{Array.isArray(licenseIds) && licenseIds.length > 0 ? (
                        <div className='text-center'>
                            <ul className='px-0'>
                                {licenseIds.map((licenseId: string, index: number) => (
                                    <li key={licenseId} style={{ display: 'inline' }}>
                                        <Link href={`/licenses/${licenseId}`} className='text-link'>
                                            {licenseId}
                                        </Link>
                                        {index >= licenseIds.length - 1 ? '' : ', '}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}</>),
                sort: true,
            },
            {
                id: 'licenseObligation.releases',
                name: t('Releases'),
                formatter: ({ releases, commonReleases }: { releases: LicenseObligationRelease[], commonReleases: any }) =>
                    _(<>{
                        Array.isArray(releases) && releases.length > 0 ? (
                            <ExpandableList releases={releases} previewString={releases.map((r) => `${r.name ?? ''} ${r.version ?? ''}`).join(', ').substring(0, 10)} commonReleases={commonReleases} />
                        ) : null
                    }</>),
                sort: true,
            },
            {
                id: 'licenseObligation.status',
                name: t('Status'),
                formatter: ({ payload, obligation, status }: { status: string, payload: ProjectObligation, obligation: string }) => {
                    return _(
                        <select
                            className='form-select'
                            id='licenseObligation.edit.status'
                            name='status'
                            value={payload?.[obligation]?.status ?? ((status && status === '') ? 'OPEN' : status)}
                            onChange={(e) => {
                                if (setPayload) {
                                    let obligationValue = payload?.[obligation] ?? {}
                                    obligationValue = { ...obligationValue, status: e.target.value }
                                    setPayload((payload: ProjectObligation) => ({ ...payload, [obligation]: obligationValue }))
                                }
                            }}
                        >
                            <option value='OPEN'>{t('Open')}</option>
                            <option value='ACKNOWLEDGED_OR_FULFILLED'>{t('Acknowledged or Fulfilled')}</option>
                            <option value='WILL_BE_FULFILLED_BEFORE_RELEASE'>{t('Will be fulfilled before release')}</option>
                            <option value='NOT_APPLICABLE'>{t('Not Applicable')}</option>
                            <option value='DEFERRED_TO_PARENT_PROJECT'>{t('Deferred to parent project')}</option>
                            <option value='FULFILLED_AND_PARENT_MUST_ALSO_FULFILL'>{t('Fulfilled and parent must also fulfill')}</option>
                            <option value='ESCALATED'>{t('Escalated')}</option>
                        </select>
                    )
                },
                width: '10%',
                sort: true,
            },
            {
                id: 'licenseObligation.type',
                name: t('Type'),
                sort: true,
            },
            {
                id: 'licenseObligation.id',
                name: t('Id'),
                sort: true,
            },
            {
                id: 'licenseObligation.comment',
                name: t('Comment'),
                formatter: ({ obligation, comment }: { comment: string, obligation: string }) => {
                    return _(
                        <input
                            type='text'
                            value={payload?.[obligation]?.comment ?? comment}
                            onClick={() => { setUpdateCommentModalData({ comment: payload?.[obligation]?.comment ?? comment, obligation }) }}
                            className='form-control'
                            placeholder={t('Enter comments')}
                            readOnly
                        />
                    )
                },
                sort: true,
            }
        ]
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const loadData = async () => {
            try {
                const session = await getSession()
                const restProj = ApiUtils.GET(
                    `projects/${projectId}/licenseObligations`,
                    session.user.access_token,
                    signal)
                const restSelectedProj = selectedProjectId
                    ? ApiUtils.GET(
                        `projects/${selectedProjectId}/licenseObligations`,
                        session.user.access_token,
                        signal) : Promise.resolve({ json: () => ({ licenseObligations: {} }) });

                const [data1, data2] = await Promise.all([
                    restProj, restSelectedProj
                ]);
                setProjectLicenseObligations(await data1.json())
                setSelectedProjectLicenseObligations(await data2.json())
            } catch (e) {
                console.error(e)
            }
        };

        loadData();
        return () => {
            controller.abort();
        };
    }, [projectId, status, selectedProjectId]);

    useEffect(() => {
        if (!projectLicenseOligations || !selectedProjectLicenseOligations)
            return
        const tableRows = [];
        for (const [key, val] of Object.entries(projectLicenseOligations.licenseObligations)) {
            const obl = val as any;
            let isMatchingKey = false, status = '', comment = '', selectedProjOblReleases = [];

            if (selectedProjectId) {
                isMatchingKey = Object.prototype.hasOwnProperty.call(selectedProjectLicenseOligations.licenseObligations, key);
                status = isMatchingKey ? selectedProjectLicenseOligations.licenseObligations[key].status : 'New Obligation';
                comment = isMatchingKey ? selectedProjectLicenseOligations.licenseObligations[key].comment : 'New Obligation';
                status = status || '';
                comment = comment || '';
                selectedProjOblReleases = isMatchingKey ? selectedProjectLicenseOligations.licenseObligations[key].releases : [];
            }

            const projOblReleases = obl.releases ?? [];
            const commonReleases = projOblReleases.filter((release: LicenseObligationRelease) => selectedProjOblReleases.some((r: any) => r.name === release.name && r.version === release.version));

            let match: boolean = false;
            if (selectedProjOblReleases.length > 0 && selectedProjOblReleases.length === projOblReleases.length) {
                match = selectedProjOblReleases.every((selectedProjRelease: any) =>
                    projOblReleases.some((projRelease: any) =>
                        projRelease.name === selectedProjRelease.name && projRelease.version === selectedProjRelease.version
                    )
                );
            }
            tableRows.push([
                {
                    id: key.split(' ').join('_'),
                    infoText: obl.text ?? '',
                },
                {
                    oblTitle: key,
                    oblStatus: status,
                    oblComment: comment,
                    match: match,
                },
                obl.licenseIds ?? [],
                {
                    releases: obl.releases ?? [],
                    commonReleases: commonReleases,
                },
                { status: obl.status ?? '', obligation: key, payload },
                obl.type ?? '',
                obl.id ?? '',
                { comment: obl.comment ?? '', obligation: key, payload }
            ])
        }
        setTableData(tableRows)
    }, [payload, selectedProjectLicenseOligations, projectLicenseOligations])

    return (
        <>
            <UpdateCommentModal modalMetaData={updateCommentModalData} setModalMetaData={setUpdateCommentModalData} payload={payload} setPayload={setPayload} />
            {
                status === 'authenticated' && tableData ?
                    <Table
                        columns={columns}
                        data={tableData}
                        selector={false}
                    /> :
                    <Spinner className='spinner col-12 mt-1 text-center' />
            }
        </>
    )
}