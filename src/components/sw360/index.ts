// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// Table component
// IS strictly derived from gridjs-react with dedicated changes
import Table from './Table/Table'
import { ReactWrapper, _ } from './Table/wrapper'

// PageButtonHeader component
import PageButtonHeader from './PageButtonHeader/PageButtonHeader'

// Quickfilter component
import QuickFilter from './QuickFilter/QuickFilter'

// Advabced search component
import AdvancedSearch from './AdvancedSearch/AdvancedSearch'

// Navvbar
import Navbar from './Navbar/Navbar'

import SideBar from './SideBar/SideBar'

import Actions from './ProjectsTable/Actions/Actions'

import WarningModal from './ProjectsTable/WarningModal/WarningModal'

import  DeleteModal from './ProjectsTable/DeleteModal/DeleteModal'

import  Summary from './AddProjects/Summary/Summary'

import  Administration from './AddProjects/Administration/Administration'

import  LinkedProjects from './AddProjects/LinkedProjects/LinkedProjects'

import  VendorsModal from './AddProjects/Summary/VendorsModal/VendorsModal'

import  AddKeyValue from './AddProjects/Summary/AddKeyValue/AddKeyValue'

import  SelectCountryComponent from './AddProjects/Summary/SelectCountry/SelectCountry'

import  AddAdditionalRoles from './AddProjects/Summary/AddAdditionalRoles/AddAdditionalRoles'

import  AddAdditionalData from './AddProjects/Summary/AddAdditionalData/AddAdditionalData'

import  UsersModal from './AddProjects/Summary/UsersModal/UsersModal'

import  DepartmentModal from './AddProjects/Summary/DepartmentModal/DepartmentModal'

import  LinkProjectsModal from './AddProjects/LinkedProjects/LinkProjectsModal/LinkProjectsModal'

import  LinkReleasesModal from './AddProjects/LinkedProjects/LinkReleasesModal/LinkReleasesModal'

import  SummaryView from './ViewProjects/SummaryView/SummaryView'

import  AdministrationView from './ViewProjects/AdministrationView/AdministrationView'

export { 
        AdvancedSearch, Navbar, PageButtonHeader, QuickFilter, 
        SideBar, Table, _, ReactWrapper, Actions, WarningModal, 
        DeleteModal, Summary, Administration, LinkedProjects,
        VendorsModal, AddKeyValue, SelectCountryComponent, 
        AddAdditionalRoles, AddAdditionalData, UsersModal,
        DepartmentModal, LinkProjectsModal, LinkReleasesModal,
        SummaryView, AdministrationView
    }
