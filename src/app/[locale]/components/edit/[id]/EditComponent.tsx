// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useEffect, useState, useCallback } from 'react'

import CommonTabIds from '@/object-types/enums/CommonTabsIds'
import ApiUtils from '@/utils/api/api.util'
import { Session } from '@/object-types/Session'
import HttpStatus from '@/object-types/enums/HttpStatus'
import { signOut } from 'next-auth/react'
import { notFound, useRouter } from 'next/navigation'
import CommonUtils from '@/utils/common.utils'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { SideBar, PageButtonHeader } from '@/components/sw360'
import { toast, TypeOptions, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import ComponentEditSummary from '@/components/sw360/ComponentEditSummary/ComponentEditSummary'
import Releases from './Releases'
import EditAttachments from '@/components/Attachments/EditAttachments'
import ComponentPayload from '@/object-types/ComponentPayLoad'

interface Props {
    session: Session
    componentId: string
}

const tabList = [
  {
      id: CommonTabIds.SUMMARY,
      name: 'Summary',
  },
  {
      id: CommonTabIds.RELEASES,
      name: 'Release',
  },
  {
      id: CommonTabIds.ATTACHMENTS,
      name: 'Attachments',
  }
]

const EditComponent = ({ session, componentId }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const router = useRouter()
    const [selectedTab, setSelectedTab] = useState<string>(CommonTabIds.SUMMARY)
    const [component, setComponent] = useState<any>(undefined)
    const [attachmentNumber, setAttachmentNumber] = useState<number>(0)
    const [componentData, setComponentData] = useState<ComponentPayload>({
        name: '',
        createBy: '',
        description: '',
        componentType: '',
        moderators: null,
        modifiedBy: '',
        modifiedOn: '',
        componentOwner: '',
        ownerAccountingUnit: '',
        ownerGroup: '',
        ownerCountry: '',
        roles: null,
        externalIds: null,
        additionalData: null,
        defaultVendorId: '',
        categories: null,
        homepage: '',
        mailinglist: '',
        wiki: '',
        blog: '',
    })

    const fetchData: any = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json()
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                signOut()
            } else {
                notFound()
            }
        },
        [session.user.access_token]
    )

    useEffect(() => {
        fetchData(`components/${componentId}`).then((component: any) => {
            setComponent(component)
            if (
                !CommonUtils.isNullOrUndefined(component['_embedded']) &&
                !CommonUtils.isNullOrUndefined(component['_embedded']['sw360:attachments'])
            ) {
                setAttachmentNumber(component['_embedded']['sw360:attachments'].length)
            }
        })

    }, [componentId, fetchData])

    const notify = (text: string, type: TypeOptions) =>
        toast(text, {
            type,
            position: toast.POSITION.TOP_LEFT,
            theme: 'colored',
        })

    const submit = async () => {
        console.log("----componentPayload----")
        console.log(componentData)
        const response = await ApiUtils.PATCH(`components/${componentId}`, componentData, session.user.access_token)

        if (response.status == HttpStatus.OK) {
            notify(`Success:Component  ${componentData.name}  updated successfully!`, 'success')
            router.push('/components/detail/' + componentId)
        } else {
            notify(t('Edit Component Fail'), 'error')
        }
    }

    const handleDeleteComponent = () => {
        console.log("-------delete--------")
    }

    const headerButtons = {
        'Update Component': { link: '/components/edit/'+componentId, type: 'primary', onClick: submit },
        'Delete Component': { link: '/components/edit/'+componentId, type: 'primary', onClick: handleDeleteComponent},
        Cancel: { link: '/components/detail/'+componentId, type: 'secondary'},
    }

    return (
        component && (
            <div className='container' style={{ maxWidth: '98vw', marginTop: '10px' }}>
                <div className='row'>
                    <div className='col-2 sidebar'>
                        <SideBar
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                            tabList={tabList}
                        />
                    </div>
                    <div className='col'>
                    <div className='row' style={{ marginBottom: '20px' }}>
                            <PageButtonHeader title={component.name} buttons={headerButtons}>
                            </PageButtonHeader>
                        </div>
                        <div className='row' hidden={selectedTab !== CommonTabIds.SUMMARY ? true : false}>
                            <ToastContainer className='foo' style={{ width: '300px', height: '100px' }} />
                            <ComponentEditSummary session={session} componentId={componentId} componentData={componentData} setComponentData={setComponentData}/>
                        </div>
                        <div className='row' hidden={selectedTab !== CommonTabIds.RELEASES ? true : false}>
                            <Releases componentId={componentId} session={session} />
                        </div>
                        {/* <div className='row' hidden={selectedTab != CommonTabIds.ATTACHMENTS ? true : false}>
                            <EditAttachments session={session} documentId={componentId} documentType={DocumentTypes.COMPONENT} />
                        </div> */}
                    </div>
                </div>
            </div>
        )
    )
}

export default EditComponent
