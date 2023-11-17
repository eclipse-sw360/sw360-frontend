// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import AddAdditionalRoles from './AddAdditionalRoles/AddAdditionalRoles'
import AddKeyValue from './AddKeyValue/AddKeyValue'
import AdvancedSearch from './AdvancedSearch/AdvancedSearch'
import AuthScreen from './AuthScreen/AuthScreen'
import ComponentOwnerDialog from './ComponentOwnerDialog/ComponentOwnerDialog'
import Footer from './Footer/Footer'
import FossologyClearing from './FossologyClearing/FossologyClearing'
import Header from './Header/Header'
import LanguageSwitcher from './LanguageSwitcher/LanguageSwitcher'
import ModeratorsDialog from './ModeratorsDialog/ModeratorsDialog'
import Navbar from './Navbar/Navbar'
import PageButtonHeader from './PageButtonHeader/PageButtonHeader'
import PageSpinner from './PageSpinner/PageSpinner'
import ProfileDropdown from './ProfileDropdown/ProfileDropdown'
import QuickFilter from './QuickFilter/QuickFilter'
import SearchUsersModal from './SearchUsersModal//SearchUsersModal'
import SearchVendorsModal from './SearchVendorsModal/SearchVendorsModal'
import VendorDialog from './SearchVendorsModal/VendorDialog'
import SelectCountry from './SelectCountry/SelectCountry'
import SelectTableComponentOwner from './SelectTableComponentOwner/SelectTableComponentOwner'
import ShowInfoOnHover from './ShowInfoOnHover/ShowInfoOnHover'
import SideBar from './SideBar/SideBar'
import ToastMessage from './ToastContainer/Toast'
import withAuth from './WithAuth/WithAuth'

// Table component
// Strictly derived from gridjs-react with dedicated changes
import Table from './Table/Table'
import { ReactWrapper, _ } from './Table/wrapper'
import TreeTable from './TreeTable/TreeTable'

export {
    AddAdditionalRoles,
    AddKeyValue,
    AdvancedSearch,
    AuthScreen,
    ComponentOwnerDialog,
    Footer,
    FossologyClearing,
    Header,
    LanguageSwitcher,
    ModeratorsDialog,
    Navbar,
    PageButtonHeader,
    PageSpinner,
    ProfileDropdown,
    QuickFilter,
    ReactWrapper,
    SearchUsersModal,
    SearchVendorsModal,
    SelectCountry,
    SelectTableComponentOwner,
    ShowInfoOnHover,
    SideBar,
    Table,
    ToastMessage,
    TreeTable,
    VendorDialog,
    _,
    withAuth,
}
