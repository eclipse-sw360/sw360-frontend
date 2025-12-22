'use client'

import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import Breadcrumb from 'react-bootstrap/Breadcrumb'

import Attachments from '@/components/Attachments/Attachments'
import ChangeLogDetail from '@/components/ChangeLog/ChangeLogDetail/ChangeLogDetail'
import ChangeLogList from '@/components/ChangeLog/ChangeLogList/ChangeLogList'
import ComponentVulnerabilities from '@/components/ComponentVulnerabilities/ComponentVulnerabilities'
import { PageButtonHeader, SideBar } from '@/components/sw360'
import {
    Changelogs,
    CommonTabIds,
    Component,
    ComponentTabIds,
    DocumentTypes,
    Embedded,
    ErrorDetails,
    LinkedVulnerability,
    PageableQueryParam,
    PaginationMeta,
    User,
    UserGroupType,
} from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import ReleaseOverview from './ReleaseOverview'
import Summary from './Summary'

type EmbeddedChangelogs = Embedded<Changelogs, 'sw360:changeLogs'>
type EmbeddedVulnerabilities = Embedded<LinkedVulnerability, 'sw360:vulnerabilityDTOes'>

interface Props {
    componentId: string
}

const DetailOverview = ({ componentId }: Props): ReactNode => {
    const t = useTranslations('default')
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [component, setComponent] = useState<Component | undefined>(undefined)
    const [vulnerData, setVulnerData] = useState<Array<LinkedVulnerability>>([])
    const [attachmentNumber, setAttachmentNumber] = useState<number>(0)
    const [subscribers, setSubscribers] = useState<Array<string>>([])
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
    const [changeLogId, setChangeLogId] = useState('')
    const [changelogTab, setChangelogTab] = useState('list-change')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [session])

    const fetchData = useCallback(
        async (url: string) => {
            if (CommonUtils.isNullOrUndefined(session.data)) return
            const response = await ApiUtils.GET(url, session.data.user.access_token)
            if (response.status === StatusCodes.OK) {
                return (await response.json()) as Component &
                    EmbeddedVulnerabilities &
                    EmbeddedChangelogs
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                return signOut()
            }
        },
        [session],
    )

    const downloadBundle = async () => {
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        await DownloadService.download(
            `${DocumentTypes.COMPONENT}/${componentId}/attachments/download`,
            session.data,
            'AttachmentBundle.zip',
        )
    }

    useEffect(() => {
        if (CommonUtils.isNullOrUndefined(session.data)) return
        setUserEmail(session.data.user.email)
    }, [session])

    useEffect(() => {
        fetchData(`components/${componentId}`)
            .then((component) => {
                if (!component) return
                setComponent(component)
                setSubscribers(
                    component._embedded?.['sw360:subscribers']?.map((u: User) => u.email) ?? [],
                )
                setAttachmentNumber(component._embedded?.['sw360:attachments']?.length ?? 0)
            })
            .catch(console.error)

        fetchData(`components/${componentId}/vulnerabilities`)
            .then((data) => {
                if (data?._embedded) {
                    setVulnerData(data._embedded['sw360:vulnerabilityDTOes'])
                }
            })
            .catch(console.error)
    }, [componentId, fetchData])

    const isUserSubscribed = () => !!userEmail && subscribers.includes(userEmail)

    const handleSubcriptions = async () => {
        if (!session.data) return
        await ApiUtils.POST(
            `components/${componentId}/subscriptions`,
            {},
            session.data.user.access_token,
        )
        const updated = await fetchData(`components/${componentId}`)
        if (updated) {
            setComponent(updated)
            setSubscribers(
                updated._embedded?.['sw360:subscribers']?.map((u: User) => u.email) ?? [],
            )
        }
    }

    const [pageableQueryParam, setPageableQueryParam] = useState<PageableQueryParam>({
        page: 0,
        page_entries: 10,
        sort: '',
    })
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>()
    const [changeLogList, setChangeLogList] = useState<Changelogs[]>([])
    const memoizedData = useMemo(() => changeLogList, [changeLogList])
    const [showProcessing, setShowProcessing] = useState(false)

    const param = useParams()
    const locale = (param.locale as string) || 'en'
    const componentsPath = `/${locale}/components`

    if (!component) {
        return (
            <div className='container page-content'>
                <div className='col-12 mt-5 text-center'>
                    <Spinner className='spinner' />
                    <p className='mt-3'>{t('Loading component details...')}</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Breadcrumb className='container page-content'>
                <Breadcrumb.Item linkAs={Link} href={componentsPath}>
                    {t('Components')}
                </Breadcrumb.Item>
                <Breadcrumb.Item active>{component.name}</Breadcrumb.Item>
            </Breadcrumb>

            <div className='container page-content'>
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <SideBar
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                            tabList={[
                                { id: CommonTabIds.SUMMARY, name: 'Summary' },
                                { id: ComponentTabIds.RELEASE_OVERVIEW, name: 'Release Overview' },
                                { id: CommonTabIds.ATTACHMENTS, name: 'Attachments' },
                                { id: CommonTabIds.VULNERABILITIES, name: 'Vulnerabilities' },
                                { id: CommonTabIds.CHANGE_LOG, name: 'Change Log' },
                            ]}
                            vulnerabilities={vulnerData}
                        />
                    </div>

                    <div className='col'>
                        <PageButtonHeader title={component.name} buttons={{}} />
                        <div hidden={selectedTab !== CommonTabIds.SUMMARY}>
                            <Summary component={component} componentId={componentId} />
                        </div>
                        <div hidden={selectedTab !== ComponentTabIds.RELEASE_OVERVIEW}>
                            <ReleaseOverview componentId={componentId} />
                        </div>
                        <div hidden={selectedTab !== CommonTabIds.ATTACHMENTS}>
                            <Attachments
                                documentId={componentId}
                                documentType={DocumentTypes.COMPONENT}
                            />
                        </div>
                        <div hidden={selectedTab !== CommonTabIds.VULNERABILITIES}>
                            <ComponentVulnerabilities vulnerData={vulnerData} />
                        </div>
                        <div hidden={selectedTab !== CommonTabIds.CHANGE_LOG}>
                            <ChangeLogList
                                setChangeLogId={setChangeLogId}
                                documentId={componentId}
                                setChangesLogTab={setChangelogTab}
                                changeLogList={memoizedData}
                                pageableQueryParam={pageableQueryParam}
                                setPageableQueryParam={setPageableQueryParam}
                                showProcessing={showProcessing}
                                paginationMeta={paginationMeta}
                            />
                            <ChangeLogDetail
                                changeLogData={
                                    changeLogList.filter((d) => d.id === changeLogId)[0]
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DetailOverview
