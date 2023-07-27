// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import AdvancedSearch from './AdvancedSearch/AdvancedSearch'
import AuthScreen from './AuthScreen/AuthScreen'
import ComponentAddSummary from './ComponentAddSummary/ComponentAddSummary'
import Footer from './Footer/Footer'
import Header from './Header/Header'
import SW360Navbar from './SW360Navbar/SW360Navbar'
import PageButtonHeader from './PageButtonHeader/PageButtonHeader'
import QuickFilter from './QuickFilter/QuickFilter'
import SideBar from './SideBar/SideBar'
import VendorDialog from './SearchVendorsModal/VendorDialog'
import SelectCountryComponent from "./SelectCountry/SelectCountry"
import AddKeyValueComponent from "./AddKeyValue/AddKeyValue"
import AddAdditionalRolesComponent from "./AddAdditionalRoles/AddAdditionalRoles"
import LinkReleasesModal from './LinkReleasesModal/LinkReleasesModal'
import LinkProjectsModal from './LinkProjectsModal/LinkProjectsModal'
import DepartmentModal from './DepartmentModal/DepartmentModal'
import Summary from "./AddProjects/Summary/Summary"
import LinkedProjects from "./AddProjects/LinkedProjects/LinkedProjects"
import Administration from './AddProjects/Administration/Administration'
import SummaryView from "./ViewProjects/SummaryView/SummaryView"
import AdministrationView from './ViewProjects/AdministrationView/AdministrationView'
import UsersModal from './UsersModal/UsersModal'
import SearchUsersModal from './SearchUsersModal/SearchUsersModal'
import LicenseClearingView from './ViewProjects/LicenseClearingView/LicenseClearingView'
import ObligationsView from './ViewProjects/ObligationsView/ObligationsView'
import ECCView from './ViewProjects/ECCView/ECCView'
import VulnerabilityStatusView from './ViewProjects/VulnerabilityStatus/VulnerabilityStatus'
import AttachmentsView from "./ViewProjects/AttachmentsView/AttachmentsView"
import VulnerabilitiesView from "./ViewProjects/VulnerabilitiesView/VulnerabilitiesView"
import ChangelogView from  "./ViewProjects/ChangelogView/ChangelogView"
import ModerationRequestModal from './ModerationRequestModal/ModerationRequestModal'
import DeleteProjectModal from './DeleteProjectModal/DeleteProjectModal'
import Actions from "./ProjectsTable/Actions/Actions"

// Table component
// IS strictly derived from gridjs-react with dedicated changes
import Table from './Table/Table'
import { ReactWrapper, _ } from './Table/wrapper'

export {
    _,
    AdvancedSearch,
    AuthScreen,
    ComponentAddSummary,
    Footer,
    Header,
    SW360Navbar,
    PageButtonHeader,
    QuickFilter,
    ReactWrapper,
    SearchUsersModal,
    SideBar,
    Table,
    VendorDialog,
    AddAdditionalRolesComponent,
    AddKeyValueComponent,
    SelectCountryComponent,
    LinkReleasesModal,
    LinkProjectsModal,
    DepartmentModal,
    LinkedProjects,
    Administration,
    Summary,
    SummaryView, 
    AdministrationView,
    UsersModal,
    LicenseClearingView,
    ObligationsView,
    ECCView,
    VulnerabilityStatusView,
    AttachmentsView,
    VulnerabilitiesView,
    ChangelogView,
    ModerationRequestModal,
    DeleteProjectModal,
    Actions
}
