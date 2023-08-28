// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import AdvancedSearch from './AdvancedSearch/AdvancedSearch'
import AuthScreen from './AuthScreen/AuthScreen'
import Footer from './Footer/Footer'
import Header from './Header/Header'
import SW360Navbar from './SW360Navbar/SW360Navbar'
import PageButtonHeader from './PageButtonHeader/PageButtonHeader'
import QuickFilter from './QuickFilter/QuickFilter'
import SearchUsersModal from './SearchUsersModal//SearchUsersModal'
import SearchVendorsModal from './SearchVendorsModal/SearchVendorsModal'
import SideBar from './SideBar/SideBar'
import VendorDialog from './SearchVendorsModal/VendorDialog'

// Table component
// IS strictly derived from gridjs-react with dedicated changes
import Table from './Table/Table'
import TreeTable from './TreeTable/TreeTable'
import { ReactWrapper, _ } from './Table/wrapper'

export {
    _,
    AdvancedSearch,
    AuthScreen,
    Footer,
    Header,
    SW360Navbar,
    PageButtonHeader,
    QuickFilter,
    ReactWrapper,
    SearchUsersModal,
    SearchVendorsModal,
    SideBar,
    Table,
    TreeTable,
    VendorDialog,
}
