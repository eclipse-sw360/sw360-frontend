// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'
import { Dispatch, ReactNode, SetStateAction, useReducer, useState } from 'react'
import { PiInfoBold } from 'react-icons/pi'

import { Embedded, HttpStatus, SearchResult } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

interface SEARCH_STATE {
    project: boolean
    component: boolean
    license: boolean
    release: boolean
    obligation: boolean
    user: boolean
    vendor: boolean
    entireDocument: boolean
    package: boolean
}

type SEARCH_ACTIONS =
    | { type: 'TOGGLE_PROJECTS' }
    | { type: 'TOGGLE_COMPONENTS' }
    | { type: 'TOGGLE_LICENSES' }
    | { type: 'TOGGLE_RELEASES' }
    | { type: 'TOGGLE_OBLIGATIONS' }
    | { type: 'TOGGLE_USERS' }
    | { type: 'TOGGLE_VENDORS' }
    | { type: 'TOGGLE_PACKAGES' }
    | { type: 'TOGGLE_ENTIRE_DOCUMENT' }
    | { type: 'DESELECT_ALL' }
    | { type: 'TOGGLE_ALL' }

type EmbeddedSearchResults = Embedded<SearchResult, 'sw360:searchResults'>

function reducer(state: SEARCH_STATE, action: SEARCH_ACTIONS): SEARCH_STATE {
    switch (action.type) {
        case 'TOGGLE_PROJECTS': {
            return {
                ...state,
                project: !state.project,
            }
        }
        case 'TOGGLE_COMPONENTS': {
            return {
                ...state,
                component: !state.component,
            }
        }
        case 'TOGGLE_LICENSES': {
            return {
                ...state,
                license: !state.license,
            }
        }
        case 'TOGGLE_RELEASES': {
            return {
                ...state,
                release: !state.release,
            }
        }
        case 'TOGGLE_PACKAGES': {
            return {
                ...state,
                package: !state.package,
            }
        }
        case 'TOGGLE_OBLIGATIONS': {
            return {
                ...state,
                obligation: !state.obligation,
            }
        }
        case 'TOGGLE_USERS': {
            return {
                ...state,
                user: !state.user,
            }
        }
        case 'TOGGLE_VENDORS': {
            return {
                ...state,
                vendor: !state.vendor,
            }
        }
        case 'TOGGLE_ENTIRE_DOCUMENT': {
            return {
                ...state,
                entireDocument: !state.entireDocument,
            }
        }
        case 'DESELECT_ALL': {
            return {
                project: false,
                component: false,
                license: false,
                release: false,
                obligation: false,
                user: false,
                vendor: false,
                entireDocument: false,
                package: false,
            }
        }
        case 'TOGGLE_ALL': {
            return {
                project: !state.project,
                component: !state.component,
                license: !state.license,
                release: !state.release,
                obligation: !state.obligation,
                user: !state.user,
                vendor: !state.vendor,
                entireDocument: !state.entireDocument,
                package: !state.package,
            }
        }
    }
}

function KeywordSearch({ setData }: { setData: Dispatch<SetStateAction<SearchResult[] | null>> }) : ReactNode {
    const t = useTranslations('default')

    const initialState: SEARCH_STATE = {
        project: false,
        component: false,
        license: false,
        release: false,
        obligation: false,
        user: false,
        vendor: false,
        entireDocument: true,
        package: false,
    }

    const [searchOptions, dispatch] = useReducer(reducer, initialState)
    const [searchText, setSearchText] = useState('')

    const handleSearch = async () => {
        try {
            setData(null)
            let queryUrl = 'search'
            let paramString = ''
            paramString += `?searchText=${encodeURIComponent(searchText)}`
            for (const k in searchOptions) {
                if (searchOptions[k as keyof SEARCH_STATE] === false) continue
                if (k === 'entireDocument') {
                    paramString += '&typeMasks=document'
                } else {
                    paramString += `&typeMasks=${encodeURIComponent(k)}`
                }
            }
            queryUrl += paramString

            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                await signOut()
                return
            }

            const response = await ApiUtils.GET(queryUrl, session.user.access_token)
            if (response.status === HttpStatus.UNAUTHORIZED) {
                await signOut()
                return
            } else if (response.status === HttpStatus.NO_CONTENT) {
                setData([])
                return
            } else if (response.status !== HttpStatus.OK) {
                notFound()
            }
            const data = await response.json() as EmbeddedSearchResults
            if (!CommonUtils.isNullEmptyOrUndefinedArray(data['_embedded']['sw360:searchResults']))
                setData(data['_embedded']['sw360:searchResults'])
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <>
            <div className='card-deck'>
                <div id='keyword-search' className='card'>
                    <div className='card-header'>{t('Keyword Search')}</div>
                    <div className='card-body'>
                        <input
                            type='text'
                            className='form-control'
                            value={searchText}
                            placeholder={t('Keyword Search')}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <div className='row mt-2 header-1 border-bottom'>
                            <h6 className='col-lg-10 fw-bold'>{t('RESTRICT TO TYPE')}</h6>
                            <h6 className='col-lg-2'>
                                <PiInfoBold />
                            </h6>
                        </div>
                        <div className='form-check mt-1'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                checked={searchOptions.project}
                                onChange={() => dispatch({ type: 'TOGGLE_PROJECTS' })}
                                id='keyboard-check-projects'
                            />
                            <label className='form-check-label fw-medium' htmlFor='keyboard-check-projects'>
                                <svg className='project_icon mb-1' height={18} width={18}>
                                    <use href='icons.svg#project'></use>
                                </svg>{' '}
                                {'Projects'}
                            </label>
                        </div>
                        <div className='form-check mt-1'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                checked={searchOptions.component}
                                onChange={() => dispatch({ type: 'TOGGLE_COMPONENTS' })}
                                id='keyboard-check-components'
                            />
                            <label className='form-check-label fw-medium' htmlFor='keyboard-check-components'>
                                <svg className='component_icon mb-1' height={18} width={18}>
                                    <use href='icons.svg#component'></use>
                                </svg>{' '}
                                {'Components'}
                            </label>
                        </div>
                        <div className='form-check mt-1'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                checked={searchOptions.license}
                                onChange={() => dispatch({ type: 'TOGGLE_LICENSES' })}
                                id='keyboard-check-licenses'
                            />
                            <label className='form-check-label fw-medium' htmlFor='keyboard-check-licenses'>
                                <svg className='license_icon mb-1' height={18} width={18}>
                                    <use href='icons.svg#license'></use>
                                </svg>{' '}
                                {'Licenses'}
                            </label>
                        </div>
                        <div className='form-check mt-1'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                checked={searchOptions.release}
                                onChange={() => dispatch({ type: 'TOGGLE_RELEASES' })}
                                id='keyboard-check-releases'
                            />
                            <label className='form-check-label fw-medium' htmlFor='keyboard-check-releases'>
                                <svg className='release_icon mb-1' height={18} width={18}>
                                    <use href='icons.svg#release'></use>
                                </svg>{' '}
                                {'Releases'}
                            </label>
                        </div>
                        <div className='form-check mt-1'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                checked={searchOptions.package}
                                onChange={() => dispatch({ type: 'TOGGLE_PACKAGES' })}
                                id='keyboard-check-packages'
                            />
                            <label className='form-check-label fw-medium' htmlFor='keyboard-check-packages'>
                                <svg className='package_icon mb-1' height={18} width={18}>
                                    <use href='icons.svg#project'></use>
                                </svg>{' '}
                                {'Packages'}
                            </label>
                        </div>
                        <div className='form-check mt-1'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                checked={searchOptions.obligation}
                                onChange={() => dispatch({ type: 'TOGGLE_OBLIGATIONS' })}
                                id='keyboard-check-obligations'
                            />
                            <label className='form-check-label fw-medium' htmlFor='keyboard-check-obligations'>
                                <svg className='obligation_icon mb-1' height={18} width={18}>
                                    <use href='icons.svg#obligation'></use>
                                </svg>{' '}
                                {'Obligations'}
                            </label>
                        </div>
                        <div className='form-check mt-1'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                checked={searchOptions.user}
                                onChange={() => dispatch({ type: 'TOGGLE_USERS' })}
                                id='keyboard-check-users'
                            />
                            <label className='form-check-label fw-medium' htmlFor='keyboard-check-users'>
                                <svg className='user_icon mb-1' height={18} width={18}>
                                    <use href='icons.svg#user'></use>
                                </svg>{' '}
                                {'Users'}
                            </label>
                        </div>
                        <div className='form-check mt-1'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                checked={searchOptions.vendor}
                                onChange={() => dispatch({ type: 'TOGGLE_VENDORS' })}
                                id='keyboard-check-vendors'
                            />
                            <label className='form-check-label fw-medium' htmlFor='keyboard-check-vendors'>
                                <svg className='vendor_icon mb-1' height={18} width={18}>
                                    <use href='icons.svg#vendor'></use>
                                </svg>{' '}
                                {'Vendors'}
                            </label>
                        </div>
                        <div className='form-check mt-1'>
                            <input
                                className='form-check-input'
                                type='checkbox'
                                checked={searchOptions.entireDocument}
                                onChange={() => dispatch({ type: 'TOGGLE_ENTIRE_DOCUMENT' })}
                                id='keyboard-check-entire-document'
                            />
                            <label className='form-check-label fw-medium' htmlFor='keyboard-check-entire-document'>
                                {'Entire Document'}
                            </label>
                        </div>
                        <div className='row mt-2'>
                            <div className='btn-group' role='group' aria-label='Toggle buttons'>
                                <button
                                    type='button'
                                    className='btn btn-sm btn-secondary'
                                    onClick={() => dispatch({ type: 'TOGGLE_ALL' })}
                                >
                                    {'Toggle'}
                                </button>
                                <button
                                    type='button'
                                    className='btn btn-sm btn-secondary'
                                    onClick={() => dispatch({ type: 'DESELECT_ALL' })}
                                >
                                    {'Deselect All'}
                                </button>
                            </div>
                        </div>
                        <div className='row mt-4 px-2'>
                            <button type='button' className='btn btn-sm btn-primary' onClick={() => void handleSearch()}>
                                {t('Search')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default KeywordSearch
