// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// Interfaces
import AccessToken from './AccessToken'
import AddtionalDataType from './AddtionalDataType'
import AdministrationDataType from './AdministrationDataType'
import Attachment from './Attachment'
import { AttachmentUsage, AttachmentUsages, SaveUsagesPayload } from './AttachmentUsages'
import AuthToken from './AuthToken'
import Changelogs from './Changelogs'
import ClearingInformation from './ClearingInformation'
import ClearingRequest from './ClearingRequest'
import ClearingRequestComments from './ClearingRequestComments'
import ClearingRequestDetails from './ClearingRequestDetails'
import COTSDetails from './COTSDetails'
import Component from './Component'
import ComponentPayload from './ComponentPayLoad'
import Configuration from './Configuration'
import CreateClearingRequestPayload from './CreateClearingRequestPayload'
import CVEReference from './CVEReference'
import ImportSBOMMetadata from './cyclonedx/ImportSBOMMetadata'
import ImportSummary from './cyclonedx/ImportSummary'
import ECCInterface from './ECC'
import ECCInformation from './ECCInformation'
import Embedded from './Embedded'
import ErrorDetails from './error'
import FossologyConfig from './FossologyConfig'
import FossologyProcessInfo from './FossologyProcessInfo'
import FossologyProcessStatus from './FossologyProcessStatus'
import InputKeyValue from './InputKeyValue'
import LicenseClearing from './LicenseClearing'
import LicenseDetail from './LicenseDetail'
import LicensePayload from './LicensePayload'
import LicenseType from './LicenseType'
import LinkedPackage from './LinkedPackage'
import LinkedPackageData from './LinkedPackageData'
import LinkedProjectData from './LinkedProjectData'
import LinkedRelease from './LinkedRelease'
import LinkedReleaseData from './LinkedReleaseData'
import LinkedVulnerability from './LinkedVulnerability'
import Links from './Links'
import ListFieldProcessComponent from './ListFieldProcessComponent'
import { Message, MessageOptions } from './Message'
import ModerationRequest from './ModerationRequest'
import ModerationRequestDetails from './ModerationRequestDetails'
import ModerationRequestPayload from './ModerationRequestPayload'
import NavItem from './NavItem'
import NavList from './NavList'
import NodeData from './NodeData'
import OAuthClient from './OAuthClient'
import { Obligation, ObligationData, ObligationEntry, ObligationRelease, ObligationResponse } from './Obligation'
import Package from './Package'
import { ColumnMeta, FilterOption, NestedRows, PageableQueryParam, PaginationMeta, TypedEntity } from './Pageable'
import Preferences from './Preferences'
import { Project, ProjectLinkedRelease } from './Project'
import ProjectPayload from './ProjectPayload'
import { ProjectData, ProjectVulnerability, VulnerabilityRatingAndActionPayload } from './ProjectVulnerabilityTypes'
import Release from './Release'
import ReleaseDetail from './ReleaseDetail'
import ReleaseLink from './ReleaseLink'
import ReleaseNode from './ReleaseNode'
import Repository from './Repository'
import RequestContent from './RequestContent'
import Resources from './Resources'
import RestrictedResource from './RestrictedResource'
import RolesType from './RolesType'
import SearchDuplicatesResponse from './SearchDuplicateResponse'
import SearchResult from './SearchResult'
import Session from './Session'
import SummaryDataType from './SummaryDataType'
import Annotations from './spdx/Annotations'
import CheckSum from './spdx/CheckSum'
import Creator from './spdx/Creator'
import DocumentCreationInformation from './spdx/DocumentCreationInformation'
import DocumentState from './spdx/DocumentState'
import ExternalDocumentReferences from './spdx/ExternalDocumentReferences'
import ExternalReference from './spdx/ExternalReference'
import ModerationState from './spdx/ModerationState'
import OtherLicensingInformationDetected from './spdx/OtherLicensingInformationDetected'
import PackageInformation from './spdx/PackageInformation'
import PackageVerificationCode from './spdx/PackageVerificationCode'
import RelationshipsBetweenSPDXElements from './spdx/RelationshipsBetweenSPDXElements'
import RequestedAction from './spdx/RequestedAction'
import SnippetInformation from './spdx/SnippetInformation'
import SnippetRange from './spdx/SnippetRange'
import SPDX from './spdx/SPDX'
import SPDXDocument from './spdx/SPDXDocument'
import ToastData from './ToastData'
import UpdateClearingRequestPayload from './UpdateClearingRequestPayload'
import { User, UserPayload } from './User'
import UserCredentialInfo from './UserCredentialInfo'
import Vendor from './Vendor'
import VendorAdvisory from './VendorAdvisory'
import VerificationStateInfo from './VerificationStateInfo'
import Vulnerability from './Vulnerability'
import { ProjectVulnerabilityTrackingStatus, VulnerabilityTrackingStatus } from './VulnerabilityTrackingStatus'

export type {
    AccessToken,
    AddtionalDataType,
    AdministrationDataType,
    Annotations,
    Attachment,
    AttachmentUsage,
    AttachmentUsages,
    AuthToken,
    Changelogs,
    CheckSum,
    ClearingInformation,
    ClearingRequest,
    ClearingRequestComments,
    ClearingRequestDetails,
    ColumnMeta,
    Component,
    ComponentPayload,
    Configuration,
    COTSDetails,
    CreateClearingRequestPayload,
    Creator,
    CVEReference,
    DocumentCreationInformation,
    DocumentState,
    ECCInterface,
    ECCInformation,
    Embedded,
    ErrorDetails,
    ExternalDocumentReferences,
    ExternalReference,
    FilterOption,
    FossologyConfig,
    FossologyProcessInfo,
    FossologyProcessStatus,
    ImportSBOMMetadata,
    ImportSummary,
    InputKeyValue,
    LicenseClearing,
    LicenseDetail,
    LicensePayload,
    LicenseType,
    LinkedPackage,
    LinkedPackageData,
    LinkedProjectData,
    LinkedRelease,
    LinkedReleaseData,
    LinkedVulnerability,
    Links,
    ListFieldProcessComponent,
    Message,
    MessageOptions,
    ModerationRequest,
    ModerationRequestDetails,
    ModerationRequestPayload,
    ModerationState,
    NavItem,
    NestedRows,
    NodeData,
    OAuthClient,
    Obligation,
    ObligationData,
    ObligationEntry,
    ObligationRelease,
    ObligationResponse,
    OtherLicensingInformationDetected,
    Package,
    PackageInformation,
    PackageVerificationCode,
    PageableQueryParam,
    PaginationMeta,
    Project,
    ProjectData,
    ProjectLinkedRelease,
    ProjectPayload,
    ProjectVulnerability,
    ProjectVulnerabilityTrackingStatus,
    RelationshipsBetweenSPDXElements,
    Release,
    ReleaseDetail,
    ReleaseLink,
    ReleaseNode,
    Repository,
    RequestContent,
    RequestedAction,
    Resources,
    RestrictedResource,
    RolesType,
    SaveUsagesPayload,
    SearchDuplicatesResponse,
    SearchResult,
    Session,
    SnippetInformation,
    SnippetRange,
    SPDX,
    SPDXDocument,
    SummaryDataType,
    ToastData,
    TypedEntity,
    UpdateClearingRequestPayload,
    User,
    UserCredentialInfo,
    UserPayload,
    Vendor,
    VendorAdvisory,
    VerificationStateInfo,
    Vulnerability,
    VulnerabilityRatingAndActionPayload,
    VulnerabilityTrackingStatus,
}

// Special functions for populate data
export { NavList, Preferences }

// Enums + Constants
import AttachmentTypes from './constants/AttachmentTypes'
import CommonTabIds from './constants/CommonTabsIds'
import ComponentTabIds from './constants/ComponentTabIds'
import HttpStatus from './constants/HttpStatus'
import LicenseTabIds from './constants/LicenseTabIds'
import ReleaseTabIds from './constants/ReleaseTabIds'
import ActionType from './enums/ActionType'
import ClearingRequestStates from './enums/ClearingRequestStates'
import ConfigKeys from './enums/ConfigKeys'
import DocumentTypes from './enums/DocumentTypes'
import MergeOrSplitActionType from './enums/MergeOrSplitActionType'
import ObligationType from './enums/ObligationType'
import ProjectVulnerabilityTabType from './enums/ProjectVulnerabilityTabType'
import ReleaseClearingStateMapping from './enums/ReleaseClearingStateMapping'
import RequestDocumentTypes from './enums/RequestDocumentTypes'
import RequestType from './enums/RequestType'
import UserGroupType from './enums/UserGroupType'
import VulnerabilitiesVerificationState from './enums/VulnerabilitiesVerificationState'

export {
    ActionType,
    AttachmentTypes,
    ClearingRequestStates,
    CommonTabIds,
    ComponentTabIds,
    ConfigKeys,
    DocumentTypes,
    HttpStatus,
    LicenseTabIds,
    MergeOrSplitActionType,
    ObligationType,
    ProjectVulnerabilityTabType,
    ReleaseClearingStateMapping,
    ReleaseTabIds,
    RequestDocumentTypes,
    UserGroupType,
    VulnerabilitiesVerificationState,
    RequestType,
}
