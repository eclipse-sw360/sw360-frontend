# Changelog

This is the changelog file of the sw360 project. It starts with the first
release being provided at eclipse/sw360. For older releases, please refer to
the first project location:

https://github.com/eclipse-sw360/sw360/releases

## v1.0.0-rc.1

This is a first release candidate for SW360-Frontend in the line of next major
release version 1.0.0 of SW360-Frontend project. The candidate includes numerous
features, corrections, and improvements over the previous beta-release
[v0.30.0-beta](https://github.com/eclipse-sw360/sw360-frontend/releases/tag/v0.30.0-beta)

This release candidate serves as a preview of the upcoming major version 1.0.0
for testing and should not be used in production environments.

Major highlights since last release:
* Role based access to routes
* Fixed singouts at component detail page
* Complete feature of Merge Releases
* Provided container setup for running SW360 frontend and backend
* Lot of code refactor and unifications

### Credits

The following GitHub users have contributed to the source code since the last release (in alphabetical order):

```
> aaryan359 <aaryanmeena96@gmail.com>
> Akshit Joshi <akshit.joshi@siemens-healthineers.com>
> Amrit Kumar Verma <er.akverma8@gmail.com>
> Arnav Sharma <2006arnavsharma@gmail.com>
> Bibhuti Bhusan Dash <bibhuti230185@gmail.com>
> Dearsh Oberoi <oberoidearsh@gmail.com>
> dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
> developharsh <harsh237hk@gmail.com>
> Farooq Fateh Aftab <farooq-fateh.aftab@siemens.com>
> Gaurav Mishra <mishra.gaurav@siemens.com>
> Keerthi B L <keerthi.bl@siemens.com>
> Nikesh Kumar <kumar.nikesh@siemens.com>
> Rohan-Saxena644 <rohsax83@gmail.com>
> rudra-superrr <prabhuchopra@gmail.com>
> Sahilpreet Singh <147434046+sps1001@users.noreply.github.com>
> Sandip Mandal <sandipmandal02.sm@gmail.com>
> StepSecurity Bot <bot@stepsecurity.io>
> Suhas N <suhas.n@siemens-healthineers.com>
> Taanvi Khevaria <taanvikhevaria@gmail.com>
```

Please note that also many other persons usually contribute to the project with
reviews, testing, documentations, conversations or presentations.

### Features

* `007a897a` feat(cd): Sign Docker images with GitHub OIDC
* `41762c2c` [StepSecurity] Apply security best practices (#1595)
* `34823b11` feat(docker): Update container setup and docs
* `e2233e01` feat(UI): Unify link releases modal components
* `efe0518a` feat(Release): Completes the `Merge Release` functionality (Part-3) (#1530)
* `a3385a4b` feat(Project): Add SW360 backend configuration context and update project report handling (#1522)
* `0080ca78` feat(release): Implement Linked Packages in Edit Release page (#1231)
* `481189c4` feat(home): Add delete functionality at MyTaskSubmissionsWidget

### Corrections

* `4788ca60` fix(components): handle empty response in release overview
* `d7ea6a9d` fix(modals): Reset pagination on search in modals
* `70f7e30f` fix(clearingdetails): Exclude rejected cli files from clearing details tab
* `21f7aef7` fix(cd): Docker build does not need node
* `30d5ac3b` fix(cd): Fix docker build
* `41762c2c` [StepSecurity] Apply security best practices (#1595)
* `f1b9ef8d` fix(Vul): Fixed release detail url at vul tracking tab (#1589)
* `fcf850c6` fix(UI): fix pagination and sorting in search vendor modal (#1545)
* `a6e6aa09` fix(ProjectDetailTab): Enhance breadcrumb to include project version if available
* `50b4a2db` fix(projects): Fix error response on patch request to project
* `51779264` fix(Component): Implement clipboard functionality for component ID
* `38e2ccc4` fix(Project): Enable security vulnerability monitoring options in project page
* `dfce4f2c` fix(Project): Fixed clear button at roles of edit project (#1574)
* `e7fbc81c` Revert "fix(header): Restricting CSP header values"
* `21415dbf` fix(UI): Added code to resolve merge release (#1565)
* `e6341c6e` fix(header): Restricting CSP header values
* `4114291c` fix(header): Disable deprecated XSS protection header
* `048d3001` fix(error): show fallback message when error.message is empty
* `79ff64ac` fix(UI): Show linked packages and enable comments in project page (#1556)
* `efe0518a` feat(Release): Completes the `Merge Release` functionality (Part-3) (#1530)
* `909c8fb0` fix: Replace console.error with ApiUtils.reportError in clearing request components
* `03d6ad33` fix(version): Use new VersionInfo class
* `e0bd7e6a` fix(clearingteam): Correctly render clearing team in project pages
* `8f51a4a5` fix(sw360admin): Add role based access to sw360 admin to admin tab
* `db184aaf` fix(release): Fixed missing data at release edit and detail page
* `4b53f26c` fix(editRelease): Fix bugs in update release
* `42202cad` fix(signout): Fix signout in component detail page
* `0080ca78` feat(release): Implement Linked Packages in Edit Release page (#1231)
* `6e5ea8b6` fix(UI): Add logic to delete open clearing requests from request tab, when the project has deleted
* `00d4ea8d` fix(UI): Rename Group name ambiguity in component attachment page
* `24e34a2f` fix(requests): Show error message on edit Clearing Request failure
* `0f248acf` fix(UI): Vendor name not displayed in Components list
* `d6639029` fix(UI): Applied UI correction for Actions Column
* `b683e3e6` fix(access): Add role based access to routes
* `474a5f00` fix(projects): Fix broken link and missing translation

### Infrastructure

* `6338f0cb` chore(deps-dev): bump @types/node from 25.3.0 to 25.6.0
* `23f75bf0` chore(deps): bump library/nginx from 1.29.7-trixie to 1.29.8-trixie
* `3843d66e` chore(deps): bump next-intl from 4.8.3 to 4.9.1
* `bf0cb5a3` chore(deps-dev): bump react-icons from 5.5.0 to 5.6.0
* `b4faf6a4` chore(deps-dev): bump cypress from 15.13.0 to 15.13.1
* `796b0298` chore(deps): bump react from 19.2.4 to 19.2.5
* `184b3862` chore(deps): bump docker/build-push-action from 7.0.0 to 7.1.0
* `86a18f85` chore(deps): bump actions/upload-artifact from 7.0.0 to 7.0.1
* `a53bf43e` chore(deps): bump step-security/harden-runner from 2.16.1 to 2.17.0
* `ee2797bf` chore(deps): bump next from 16.2.2 to 16.2.3
* `299a1493` chore(deps): bump react-cookie from 8.0.1 to 8.1.0
* `00ec5759` chore(lint): Fixed lints with new biomejs
* `2b7f8404` chore(deps-dev): bump @biomejs/biome from 2.4.4 to 2.4.10
* `bc048fbf` chore(deps): bump next from 16.1.7 to 16.2.2
* `eeb8cb55` chore(deps-dev): bump @commitlint/cli from 20.4.2 to 20.5.0
* `dae36b9a` chore(deps-dev): bump cypress from 15.11.0 to 15.13.0
* `f32a503b` chore(deps): bump actions/setup-node from 6.0.0 to 6.3.0
* `5a4563dc` chore(deps): bump library/nginx from 1.29.6-trixie to 1.29.7-trixie
* `9f58cde1` chore(cii): Add cii best practices badge (#1603)
* `a3e58d1e` chore(deps): bump next from 16.1.6 to 16.1.7
* `1c9589ca` chore(lodash): Fixed vulnerable lodash version for cypress (#1591)
* `deaeee45` chore(nouveau): Override nouveau for h2c connect
* `172c3a3f` refactor(attachments): Refactor edit attachments table to tanstack
* `2141ddfb` chore(Clipboard): Unified copy to clipboard for pckg, release (#1585)
* `02bb1811` chore(deps): bump step-security/harden-runner from 2.16.0 to 2.16.1
* `1b0cbc59` chore(deps): bump docker/login-action from 4.0.0 to 4.1.0
* `86357772` chore(deps): bump github/codeql-action from 4.34.1 to 4.35.1
* `7ca2e9fd` chore(deps): bump step-security/harden-runner from 2.15.1 to 2.16.0
* `f3555353` chore(deps): bump github/codeql-action from 4.32.6 to 4.34.1
* `42189b9d` refactor(sidebar): Use bootstrap tab for add sidebars
* `f2a98775` chore(deps): bump docker/build-push-action from 6.19.2 to 7.0.0
* `c1838f7b` chore(deps): bump pnpm/action-setup from 4.2.0 to 4.4.0
* `0ff2bd9d` chore(deps): bump softprops/action-gh-release from 2.5.0 to 2.6.1
* `46723662` chore(deps): bump actions/dependency-review-action from 4.8.3 to 4.9.0
* `9b09b4ec` chore(deps): bump github/codeql-action from 4.32.4 to 4.32.6
* `63aba6c1` chore(deps): bump docker/setup-buildx-action from 3.12.0 to 4.0.0
* `c42518a4` chore(deps): bump step-security/harden-runner from 2.15.0 to 2.15.1
* `acbf873d` chore(deps): bump docker/login-action from 3.7.0 to 4.0.0
* `ce624cbb` chore(deps): bump docker/metadata-action from 5.10.0 to 6.0.0
* `40fcf6da` refactor(css): Refactor and remove redundant css
* `3cd57992` refactor(vendor): Remove unused code
* `8311f4bb` chore(deps): bump step-security/harden-runner from 2.14.2 to 2.15.0
* `2bde099a` chore(deps): bump actions/upload-artifact from 6.0.0 to 7.0.0
* `dfc1c8e3` chore(deps): bump preact from 10.28.3 to 10.28.4
* `b5037064` chore(deps-dev): bump @biomejs/biome from 2.4.0 to 2.4.4
* `ed9774af` chore(deps-dev): bump cypress from 15.10.0 to 15.11.0
* `816cb445` chore(deps-dev): bump systeminformation from 5.31.0 to 5.31.1
* `2a60f9cf` chore(deps-dev): bump lint-staged from 16.2.7 to 16.3.1
* `325bad98` chore(sw360Comp): Deleted unused Filter Search file
* `c2f6edae` chore(deps): bump react and @types/react
* `3e72331b` Revise commit header format to 'type(scope): message'
* `3743b210` Update CONTRIBUTING.md
* `1237da3c` Update CONTRIBUTING.md
* `81396d47` Update README.md
* `202315d6` docs(contributing): fix small typos in README and CONTRIBUTING
* `d97085f3` chore(deps-dev): bump @types/node from 25.2.3 to 25.3.0
* `ccdc923c` chore(deps-dev): bump @commitlint/cli from 20.3.1 to 20.4.2
* `200da208` chore(deps): bump dotenv from 17.2.4 to 17.3.1
* `64b68c01` chore(deps): bump next-intl from 4.8.2 to 4.8.3
* `12ce9dd0` chore(deps): bump github/codeql-action from 4.32.3 to 4.32.4
* `4bc1d2e3` chore(deps): bump actions/dependency-review-action from 4.8.2 to 4.8.3
* `cd904b34` revert: Restore to 'Delete linked project'

**Full Changelog**: https://github.com/eclipse-sw360/sw360-frontend/compare/v0.30.0-beta...v1.0.0-rc.1

## v0.30.0-beta
This is a beta release for the next major version 1.0.0 of SW360-Frontend.
The release includes numerous features, corrections, and improvements over the
previous release v0.20.0-beta.

This release serves as a preview of the upcoming major version 1.0.0 for
testing and should not be used in production environments.

Highlight of the changes includes:
* Various vulnerabilities and security fixes.
* Complete page implementation
* Introduced biomejs for linting
* Moved table framework from gridjs to tanstack table

### Credits

The following GitHub users have contributed to the source code since the last
release (in alphabetical order):

```
> aaryan359 <aaryanmeena96@gmail.com>
> Aashish Jha <aashishjha1107@gmail.com>
> afsahsyeda <afsah.syeda@siemens-healthineers.com>
> Akshit Joshi <akshit.joshi@siemens-healthineers.com>
> amritkv <er.akverma8@gmail.com>
> Anushree Bondia <anushreebondia@gmail.com>
> Bibhuti Bhusan Dash <bibhuti230185@gmail.com>
> chauhan-varun <varunchauhan097@gmail.com>
> Dearsh Oberoi <oberoidearsh@gmail.com>
> dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
> Farooq Fateh Aftab <farooq-fateh.aftab@siemens.com>
> Gaurav Mishra <mishra.gaurav@siemens.com>
> Helio Chissini de Castro <dev@heliocastro.info>
> Keerthi B L <keerthi.bl@siemens.com>
> MANOJ KUMAR KUMMARI <umanhuu@gmail.com>
> Mateusz Los <mateusz.los@extern.wenovate.de>
> nikkuma7 <49710817+nikkuma7@users.noreply.github.com>
> rudra-superrr <prabhuchopra@gmail.com>
> sandyp025 <sandipmandal02.sm@gmail.com>
> suhas-SHS <suhas.n@siemens-healthineers.com>
> Taanvi Khevaria <taanvikhevaria@gmail.com>
> Varun chauhan <115783538+chauhan-varun@users.noreply.github.com>
> Vedant5125 <vedantapraj5125@gmail.com>
```

Please note that also many other persons usually contribute to the project with
reviews, testing, documentations, conversations or presentations.

### Features

* `04c3d67b` feat(components): Show success notification on export spreadsheet action
* `fa7b8c34` feat(home): Add filter dropdown for My Projects widget
* `7206503d` feat(codeowners): Remove myself of CODEOWNERS
* `b115c6c3` feat(deps): Update next-intl
* `140b470a` feat(admin): Add bulk user upload functionality
* `630b96e6` feat(ai): Normalize instructions and remove old ones
* `7e29d897` feat: added toast box
* `3932ca87` feat(auth): Add refresh token support for Keycloak
* `6ace9b02` feat(admin): Add configurable REST API token length property
* `b59f167a` feat(licenses): Add functionality to ignore licenses
* `ef6fa5b7` feat(footer): Use correct version of sw360
* `5f9db508` feat(statuscodes): Replace hardcoded values for readble ones
* `cd7d8424` feat: Implement robust API error handling with timeout, retry logic, and a custom ApiError class
* `4586cc5c` feat: Add sorting and license file modal to license clearing table
* `d37488f7` feat(ai): Add initial AI safeguards
* `b19b058f` feat(styles): Deduplicate few css entries
* `c819b75f` feat(admin): Add Dersh as codeowner
* `f1f56f48` feat: Add delete icon next to each linked release
* `daeaeb74` feat: Add filters for releases without attachment usage set
* `a1ed6922` feat: Add search to Obligations tab
* `a1927ee1` feat: Add search bar to Obligations tab in License Detail page
* `47731b16` feat(CR): Integrate CR endpoint payload changes
* `f4890725` feat(import): Add osadl and spdx import in admin license page
* `7be9f8b5` feat(license-upload): Add params to license upload request
* `5573d64a` feat(components): Add autocomplete for Advanced Search fields
* `fdab22f6` feat(html): Add proper html decode using a library
* `0697d9d8` feat(attachment-usage): Add release filters, search, CLI badge
* `5614a081` feat(treeview): Add client-side search with filtering
* `11e75da8` feat: Add hsts minimum setup
* `75d936c8` feat(linter): Do not allow linting errors anymore
* `3d2da378` feat(Release): Added additional data section at merge release
* `28b0e572` feat(Release): Added ext ids section at merge release
* `557a9662` feat(Release): Complete general section added at merge release
* `672c0681` feat(Release): Added general section of merge release data check
* `75e26477` feat(Vulnerability): Added svm link for external id
* `40dfde9a` feat(css): Add more classes to disabled cursors
* `b108fdd5` feat(nextjs): Update to NextJS 16.x series
* `c5b54e76` feat(Request): Show open MR to the creator
* `f7468f3c` feat: Add filtering to linked packages tables
* `6f18a808` feat(Release): Added merge conditions based on attachments
* `5d364e2e` feat(Release): Added merge release overview table
* `b5690062` feat(Release): Added check for component id to merge release
* `18c76a42` feat(Release): Boiler plate code for merge release
* `912ecde9` feat(CR): Added breadcrumb at edit CR page
* `115475f6` feat(types): Migrate to http-status-codes
* `7242a0da` feat(roles): Use additional roles from config
* `22804e59` feat(configs): Use configs at more locations
* `1ef5e7b5` feat(key-value): Use SuggestionBox for keys
* `158d710d` feat(svm): Disable SVM sched if SVM disabled
* `7c94a153` feat(component): Use SuggestionBox in pages
* `78657cfb` feat(component): SuggestionBox was created
* `76bbf1df` feat(config): Use configs from API
* `a123638d` feat(config): Split configurations in tabs
* `efbfca56` feat(config): Add config for UI container
* `b80042e7` feat(logo): Add support for custom logo
* `c105b07a` feat(Breadcrumbs): Update breadcrumbs for request, package and vulnerability tabs
* `19a675f9` feat(biome): Replace Prettier and Eslint with Biome
* `13c958a5` feat(Component): Add breadcrumbs to component and release tabs
* `af28a58a` feat(releases): Add LinkedPackagesTab to release detail page
* `093ab88a` feat(changelog): Migrate changelog tables to tanstack
* `8a7521b9` feat(Project): Feature to add comment in license obligation in edit project
* `d6bdeeb2` feat(Project): Integrated APIs to update obligations based on type
* `13c32cf8` feat(TanstackMigration): migrate Add Releases Modal for Packages
* `3719bc91` feat(Project): Added comment for package table in LinkedPakages
* `7a86499b` feat(Packages): Migrate from grid.js to tanstack and add release info
* `98afe9cc` feat(vuln): Complete the implementation
* `557b5ff2` feat(SW360): Introduced breadcrumb at Project pages
* `ee8b6cb9` feat(home): Migrate my projects and my components table
* `d503c2fa` feat(licenseClearing): Table migration for projects license clearing table
* `e7d48497` feat(tanstack): Migrate from gridjs to tanstack table for linked projects modal
* `8fc0d891` feat(tanstack): Migration from gridjs to tanstack table for projects table
* `6cbe68c6` feat(Component): Introduced security user role based accesss to component page
* `250afffc` feat(Project): Introduced security user role based accesses to projects page
* `1d2c8999` feat(Vulnerability): Introduced security user role into vulnerabilities page
* `5b41f3f0` feat(Requests): Introduced security user role based access to requests page
* `bd1d9d79` feat(Packages): Introduced security user role at packages page
* `10e8cb85` feat(Licenses): Introduced security user role at licenses pages
* `cf5e2504` feat(ECC): Introduced security user role access to ECC page
* `8bcdf225` feat: Prepare release deployment

### Corrections

* `22b20af3` fix: format add proper indentation and formatting
* `4c8cfa5b` fix(error): Fix error handling in api calls
* `489a5d6f` fix(auth): AuthScreen file changes done for show and hide password
* `8007dd68` fix(UI): Report end point urls updation
* `7b988296` fix(navbar): Hide toggle on auth page
* `02b62689` fix(home): Address PR review feedback for My Projects filter
* `268bfbb9` fix(licensClearing): Use camelCase for license clearing count props
* `d6ed2080` fix(translations): Add missing translations
* `ccb9535a` fix: Resolve merge conflicts
* `9bb39580` fix(license-table): Handle empty shortName and fix license detail link
* `f7a07d38` fix(search): double encoding for search parameters
* `72e97113` fix(actions): do not build docker cron
* `778c8828` Revert "fix: Resolve license clearing table issues"
* `d29e23d9` fix: Resolve SelectUsersDialog selection issues
* `f54005c5` fix: Resolve license clearing table issues
* `322ea59c` fix(downloadlicenseinfo): Fix options in download license info modal
* `ccfdaba2` fix(loop): Fix render loop in useeffect
* `70ee1678` fix(relation): Add missing release relation for releases of root project
* `3f30aa18` fix(AdvSearch): Fixed luceneSearch param in adv search
* `8e6e5130` fix: Format code with biome
* `784b8814` fix: Use batch API for license clearing count to prevent 502 error
* `f5337454` fix(repo): fix CODEOWNERS de002 to deo002 (#1399)
* `32308dec` fix(generatelicenseinfo): Optimize logic to reduce api calls
* `99f05839` fix(UI): Vendor field shows empty on project edit page even when vendor data exists (#1393)
* `5b83cb95` fix(Config): Fixed error message on update config
* `242cd6d2` fix: Keep obligation pill always red
* `14a2fcc6` fix: merged main branch into feature branch
* `6cf1e295` fix:project relations added
* `f1a1f35d` fix:added Missing Fields in Components Detail Summary Tab
* `bb96b61c` Revert "fix(projects): Use batch API for license clearing count to prevent 502 errors"
* `faa55a59` fix(projects): Use batch API for license clearing count to prevent 502 errors
* `cc3411ae` fix: Add loading spinner to project edit page
* `1510b4d2` fix: Add Enable SVM checkbox and delete icon to Linked Projects
* `8eaf0e0a` fix(biome): Prevent to install wrong biome on dev dependencies
* `783b7ca0` fix(CR): Add tag field in CR tables
* `a9e40bdb` fix(aborterrors): Fix abort errors
* `75b27e8b` fix(loop): Fix render loop in use effect hook
* `59179c04` fix(ui): Visually distinguish disabled clearing request icon
* `7a7a2efa` fix: Remove vulnerability selection column from summary tab
* `aad9b5e9` fix: Correct obligation pill count when status changes
* `c172f82b` fix: Remove redundant processing alert
* `78b9ee96` fix: Add Alert for processing state and minor fixes in LinkedReleasesModal
* `16b85cbc` fix(projects): Show 'No Linked Release' instead of undefined
* `a2a2923d` fix: Use exact string matching in hasCliUsageSet function
* `acce82c1` fix: Address review comments - use exact string matching and improve releaseId handling
* `eb68879e` fix(requests): Fixed redirection to edit closed CR
* `c9fbf786` fix(navbar): Redirect SW360 logo to home page instead of sign-in
* `89b07574` fix(attachments): Make expand and collapse controls functional
* `a8430cef` fix: Prevent tabs from disappearing when clicking Import/Export SBOM
* `d32205f9` fix: Handle moderation request status for license updates
* `06520c27` fix(component): Resolve delete conflict message placeholders
* `19585862` fix(navbar): route SW360 logo to localized home page
* `0c53d255` fix(auth): Use POST and form data for token request
* `3d175916` fix(deverrors): Fix undefined references and ignore abort error
* `ff8699ae` fix(link): Fix link to licenses
* `e620162d` fix(intl): Add missing translations
* `b1f754d4` fix(css): Render licenses inline
* `2aef964d` fix(link): Add missing link to the bulk release edit page
* `fb9b791a` fix(css): Improve styling of project add and edit page
* `4107f65c` fix(token): Handle error messages from server correctly
* `0a95f48c` fix(token): Fix undefined reference error
* `173166a5` fix: Unescape HTML entities in Project detail components (Administration & Summary) (#1301)
* `10a69cfe` fix(biome): Proper migrate to latest version
* `fb9c981a` fix(csp): Enable localhost in development mode
* `f0046023` fix(obligations): Implement badge count and color between edit and detail views
* `1761b358` fix(linter): Formatting fixes
* `72c706d6` fix: resolve 307 redirect on component details page (#961)
* `03262275` fix(Component): Fixed delete component status messages
* `0f98b294` fix(License): Clarified error message while updating license
* `b22f2fe2` fix(react): Fix controlled component form bugs
* `66b9e6d3` fix(linktables): Fix link projects, releases and packages tables
* `49e289cb` fix(react): Upgrade react version to 19.0.2 to fix vulnerability
* `8f04d0e0` fix(linked-packages): Add missing delete action and confirmation modal
* `71dabe7f` fix(sort): Sort project and components tables by name by default
* `d1e09170` fix(search): Reeeset pagination when search value changes
* `941c28dd` fix(projects): Fix errors appearing in project details page
* `946cc123` fix(home): Fix info alert in homepage
* `31994ad4` fix(spacing): Add constant spacing in tables with pagination
* `b3d8ae57` fix(linter): Tell to system that this block is intentionally empty
* `fa2e0793` fix(lint): Apply safe layout fixes
* `0edb68eb` fix(search): Fix typeMasks parameter creations
* `a9f02ee8` fix(merge_msg): Fix the message for merge targets
* `ae66dfe8` fix(luceneSearch): Fix typo in luceneSearch
* `71c2e448` fix(gravatar): Fix the email for gravatar images
* `a1e82bd7` fix(license): Fix the search parameter name
* `9514bc35` fix(message): Stick on top
* `7cc9bc7b` fix: Use full package managers list and correct clearing state labels
* `da21485e` fix(licenses): Fix bug in license table
* `a0b6464f` fix(vendor): Fix create vendor table title
* `02c52170` fix(search): Add missing tooltip and icons
* `1a3a0095` fix(CR): Fixed edit clearing request url
* `c8cbb169` fix(Release): Fixed edit release with MR requirement check
* `dd0f28fe` fix(vuln): Fix advance search in vulnerabilities
* `72b488e2` fix(exactMatch): Fixed lucene search based on exact match
* `5f836c55` fix(project): Show backend conflict message with modified date when creating duplicate project
* `51491b26` fix(CR): Clearing Request creation is disabled wrongly for all projects
* `81c8fec1` fix(project): show 'Copied' tooltip after clicking copy-to-clipboard icon
* `0bb11574` fix(Package): Fixed delete package if used in project
* `fd502b90` fix(ci): Do not rely on workflow dependencies
* `cc9f8567` fix(docker): Proper setup docker build with env.local
* `d994976b` fix(component): Handle dlete fo Component
* `8cc0c81b` fix(release): Handle delete of Release
* `e1396e4c` fix(translation): Add missing translations
* `a68d630d` fix(Breadcrumb): Fix homepage redirection when using breadcrumb navigation
* `36ff020c` fix(Project): Fixed missing release count at administration tab
* `a71d1e95` fix(Component): Fixed edit component with MR
* `b355a59e` fix(Project): Fixed project update with MR comment
* `e70d4118` fix(Config): Fixed translations in frontend config
* `e3f47a56` fix(SW360): Removed auth overhead in popup
* `57eca255` fix(Project): Propagated delete item warning for additional roles
* `54b77634` fix(Project): Delete warning popup for ext urls, ids and additional data
* `aa79bad5` fix(Config): Fixed UI Config translations
* `d7d841bd` fix(Config): Fix typo in spreadsheet
* `eb131699` fix(logo): Normalize image
* `7961aad5` fix(src): Fix basic linting errors
* `e5d8633f` fix(production): Add env variables to docker build
* `bd2b0796` fix(User): Fixed user search based on input text
* `d8ea81cf` fix(Project): Fixed security responsible at project edit page
* `e06a55ad` fix(Project): Fixed visibility of security responsible at project detail
* `b971db55` fix(Project): Fixed project manager/responsible at edit project
* `38bae107` fix(Project): Fixed project manager and owner visibility at edit project
* `ff38c5b1` fix(Project): Fixed placeholders at edit project
* `6c1f44c4` fix(CR): Highlight open CRs in projects tab
* `226345ab` fix(CR): Fixed Edit CR payload
* `a7e1d397` fix(CR): Fixed issues at edit CR page
* `71185a60` fix(CR): Fixed missing values and clearing progressbar in CR detail page
* `0aa6e4fe` fix(CR): Fixed open CR visibility to ADMIN users
* `97ddbb28` fix(CR): Fixed multiple fileds in Open Clearing Requests table
* `c3c17773` fix(Requests): Fixed empty comment update in Open Clearing Request
* `e2f6bf9a` fix(Home): Fixed my task asignment and task submission redirecting url
* `98a3d0f3` fix(Obligation): Fixed status and comment updates at org obligations
* `ad694664` fix(Obligation): Fixed status and comment updates at project obligation
* `d438d95a` fix(Obligation): Fixed status updates at component obligation
* `65533c64` fix(Obligation): Fixed status updates in license obligations
* `abf72869` fix(Obligation): Feature to update component obligation comment
* `19823a3b` fix(Obligation): Made generic update license comment modal
* `18e890bc` fix(Changelog): Fixed changelog errors when API response status is OK but empty body
* `ae1e9849` fix(Obligations): Fixed obligation Ids for license, project, component and org obligations
* `c089077f` fix(Licenses): Fixed `Unexpected JSON input` error at license page
* `e6ba8f46` fix(table): Correct url for task submissions and update license clearing on page change
* `ff9d46c1` fix(Advanced_Search): Fixed lucene search feature based on exact match
* `ee9941c7` fix(CR): Added fix for clearing request view
* `4b7bf549` fix: Adjusr Dockrfile to use new ts based config
* `b2d121de` fix: Adjust German language paramenter
* `f206e771` fix: Fix session handling in component releases view
* `cf0ba1f5` fix(Admin): Fixed signout functionality at admin tab
* `bcda1063` fix(Vulnerability): Fixed signout at vulnerabilities tab
* `63557226` fix(Search): Fixed signout at search page
* `84705d60` fix(Requests): Fixed signout functionality at all pages under requests tab
* `257232a2` fix(Preferences): Fixed signout at preferences tab
* `9a87063d` fix(Packages): Fixed signout functionality at packages tab
* `efb2e007` fix(Licenses): Fixed signout at all pages under licenses tab
* `e1586db6` fix(ECC): Fixed signout functionality at ECC page
* `e66d39a1` fix(Component): Fixed signout at all relevant pages of components tab
* `a28017c9` fix(Project): Fixed signout at all pages under projects tab
* `67c4b1b9` fix(SW360): Fixed signOut functionality at api calls
* `23f1de35` fix(tanstack): Remove tanstack sorted model when enabling manual sorting
* `4c8abac0` fix(linked-packages): Handle updated API response and restore UI table rendering
* `4df1fcbb` fix: Fail on build instead of ignore it
* `3d8ce47d` fix(Licenses): Fixed interface type mismatches
* `7c08d7f1` fix(npm): Fixed eslint-plugin-kit vulnerability
* `2f618031` fix(async-await): Fixed missing async await typos
* `68bf7bc3` fix(Licenses): Fixed delete license with proper message
* `d593a6ba` fix(Licenses): Added missing data of license type at license detail page
* `05cf66c9` fix(Users): Fixed user search at admin page
* `22a5c619` fix(Adv_Search): Fixed exact match and orphan package check in advance search
* `aed7f5bb` fix(Licenses): Fixed translations at add license page
* `cd1a56bc` fix(vulnerabilities): Fix ui issues in vulnerabilities tab

### Infrastructure

* `1327ec20` chore(Beta): Branch for release 0.30.0-beta
* `6cb98001` chore(deps-dev): bump @biomejs/biome from 2.3.14 to 2.4.0
* `5459bc94` chore(deps-dev): bump systeminformation from 5.30.7 to 5.31.0
* `4d5c22e3` chore(deps): bump docker/build-push-action from 6.18.0 to 6.19.2
* `c4e7e629` chore(deps): bump github/codeql-action from 4.32.2 to 4.32.3
* `38782e75` chore(deps): bump next-intl from 4.8.1 to 4.8.2
* `312921dd` chore(deps-dev): bump @types/node from 25.2.0 to 25.2.3
* `85e592e7` chore: Suppress biome lint warning for console.log in handleDeleteProject.
* `4c60d5ff` refactor: Remove console.log statements and replace with console.error for better error handling in MyTaskSubmissionsWidget
* `1176bb8a` refactor: Replace 'console.log' with 'console.error' for error handling and apply minor formatting adjustments.
* `f7921598` refactor(auth): Use Bootstrap icons for password toggle
* `854efdee` chore(instructions): merge git-commit-instructions
* `99ef6524` Revert "refactor(styles): Unify all styles in globals"
* `822d4cc6` chore(deps-dev): bump cypress from 15.9.0 to 15.10.0
* `5304d07d` chore(deps): bump docker/login-action from 3.6.0 to 3.7.0
* `78803f74` chore(deps-dev): bump systeminformation from 5.30.6 to 5.30.7
* `56b0816c` chore(deps): bump dotenv from 17.2.3 to 17.2.4
* `a7433892` chore(deps): bump html-react-parser from 5.2.12 to 5.2.17
* `395f351d` chore(deps-dev): bump @biomejs/biome from 2.3.13 to 2.3.14
* `43e745a8` chore(deps): bump step-security/harden-runner from 2.14.1 to 2.14.2
* `084a3260` chore(deps): bump github/codeql-action from 4.32.0 to 4.32.2
* `a90277ab` docs(instructions): add Copilot instructions for frontend development (#1426)
* `0f45887b` chore(deps): bump github/codeql-action from 4.31.11 to 4.32.0
* `b8103373` chore(deps-dev): bump @types/node from 25.0.9 to 25.2.0 (#1432)
* `57380fb2` chore(deps): bump next from 16.1.4 to 16.1.6
* `0d41a19f` chore(deps): bump step-security/harden-runner from 2.14.0 to 2.14.1
* `0c9413db` chore(deps): bump preact from 10.28.2 to 10.28.3
* `e184979b` chore(deps-dev): bump @biomejs/biome from 2.3.12 to 2.3.13
* `28a2ffd5` docs(instructions): add Copilot instructions for frontend development
* `1a1ca9bf` chore(deps): bump actions/checkout from 6.0.1 to 6.0.2
* `1b6e556f` refactor: Improve loading state in dependency network views
* `3cbb4f03` chore(deps): bump next from 16.1.3 to 16.1.4
* `51645112` chore(deps): bump github/codeql-action from 4.31.10 to 4.31.11
* `8139126f` chore(deps): bump webiny/action-conventional-commits from 1.3.0 to 1.3.1
* `48917037` chore(deps-dev): bump systeminformation from 5.30.5 to 5.30.6
* `5c435ab0` chore(deps-dev): bump @biomejs/biome from 2.3.11 to 2.3.12
* `6dadc0f2` chore(deps-dev): bump prettier from 3.8.0 to 3.8.1
* `6adf9993` chore(deps): bump html-react-parser from 5.2.11 to 5.2.12
* `73df34a7` refactor: Replace MessageService.error with ApiUtils.reportError across multiple components (#1401)
* `cbcd7f75` chore(deps-dev): bump cypress from 15.8.2 to 15.9.0
* `4c21ee09` chore(deps-dev): bump @types/node from 25.0.6 to 25.0.9
* `903da9fd` chore(deps): bump github/codeql-action from 4.31.9 to 4.31.10
* `799040a6` chore(deps): bump next from 16.1.1 to 16.1.3
* `595d060f` chore(deps-dev): bump systeminformation from 5.30.3 to 5.30.5
* `de6dc23b` chore(deps-dev): bump prettier from 3.7.4 to 3.8.0
* `674d369c` Revert "refactor: Use ApiUtils.POST for batch license clearing API"
* `458fdf47` refactor: Use ApiUtils.POST for batch license clearing API
* `1721602c` chore(lint): Remove unused imports
* `78f795a1` chore(biome): Add noUnusedImports check as error
* `122d8608` chore(translations): Add missing translations
* `4f060718` chore(transtaltions): Add translations
* `95a122b6` refactor(styles): Unify all styles in globals
* `b9ceffb4` refactor: Replace inline styles with CSS class for disabled icon
* `4c7088e9` refactor: Use granular loading states for processing indicator
* `e3bfac9b` refactor: Improve type safety in ChangeLog component
* `75748f8b` chore(deps-dev): bump @commitlint/cli from 20.3.0 to 20.3.1
* `17bbdef2` chore(deps-dev): bump cypress from 15.8.1 to 15.8.2
* `1cc485fb` chore(deps-dev): bump systeminformation from 5.29.0 to 5.30.3
* `7eea4e39` chore(deps-dev): bump @types/node from 25.0.3 to 25.0.6
* `da1206d5` chore(deps): bump preact from 10.28.1 to 10.28.2
* `ccccec7c` refactor(icons): Standardize icon usage and styling site wide
* `b7caa596` chore(deps-dev): bump @commitlint/cli from 20.2.0 to 20.3.0
* `5c7e979a` chore(deps): bump next-intl from 4.6.0 to 4.7.0
* `4668746b` chore(deps-dev): bump @biomejs/biome from 2.3.10 to 2.3.11
* `a4fea64b` chore(deps-dev): bump systeminformation from 5.28.3 to 5.29.0
* `b14bda6c` chore(deps-dev): bump systeminformation from 5.27.14 to 5.28.3
* `cd87791e` chore(deps-dev): bump cypress from 15.8.0 to 15.8.1
* `0a4c1ff8` chore(deps): bump next from 16.1.0 to 16.1.1
* `5fb63e6d` chore(deps): bump preact from 10.28.0 to 10.28.1
* `8a5e5faa` chore(deps-dev): bump @types/node from 25.0.2 to 25.0.3
* `11da1a73` chore(deps): bump github/codeql-action from 4.31.8 to 4.31.9
* `c6ebfd58` chore(deps): bump docker/setup-buildx-action from 3.11.1 to 3.12.0
* `0aed9d4d` chore(deps-dev): bump @biomejs/biome from 2.3.8 to 2.3.10
* `24ef1fbf` chore(deps): bump html-react-parser from 5.2.10 to 5.2.11
* `918dfd95` chore(deps): bump next from 16.0.10 to 16.1.0
* `b9881d12` chore(deps): Update cypress and systeminformation
* `12fdadb0` chore(deps): bump next-intl from 4.5.8 to 4.6.0
* `6b2fd730` chore(deps): bump step-security/harden-runner from 2.13.3 to 2.14.0
* `697c8f7c` chore(deps): bump actions/cache from 4 to 5
* `6650bd1a` chore(deps): bump github/codeql-action from 4.31.7 to 4.31.8
* `ba0e3eb4` chore(deps): bump actions/upload-artifact from 5.0.0 to 6.0.0
* `38cea9da` chore(deps): bump next from 16.0.7 to 16.0.10
* `264b9343` chore(deps-dev): bump @types/node from 24.10.1 to 25.0.2
* `cf1f914b` refactor(Release): Refactored general section of merge release
* `7e59b9d7` chore(deps): bump actions/checkout from 6.0.0 to 6.0.1
* `24d2e971` chore(deps): bump github/codeql-action from 4.31.5 to 4.31.7
* `1ddd5997` chore(deps): bump softprops/action-gh-release from 2.4.2 to 2.5.0
* `a6a4816f` chore(deps): bump step-security/harden-runner from 2.13.2 to 2.13.3
* `6cb95fdb` chore(deps-dev): bump @commitlint/cli from 20.1.0 to 20.2.0
* `9331e797` chore(deps): bump preact from 10.27.2 to 10.28.0
* `495edbb1` chore(deps-dev): bump cypress from 15.7.0 to 15.7.1
* `2f3ea7dc` chore(deps): bump next-intl from 4.5.7 to 4.5.8
* `ddf50e45` chore(deps-dev): bump prettier from 3.7.3 to 3.7.4
* `78403ea1` chore(deps): bump next from 16.0.6 to 16.0.7
* `e8e10a12` chore(deps): bump next-intl from 4.5.5 to 4.5.6
* `86130133` chore(deps): bump next from 16.0.3 to 16.0.6
* `3066aa05` chore(deps-dev): bump @biomejs/biome from 2.3.7 to 2.3.8
* `57b7a9f9` chore(deps-dev): bump prettier from 3.6.2 to 3.7.3
* `70a6a339` chore(deps): bump github/codeql-action from 4.31.4 to 4.31.5
* `3fd7a8c5` chore(deps): bump docker/metadata-action from 5.9.0 to 5.10.0
* `02ee690c` chore(deps-dev): bump lint-staged from 16.2.6 to 16.2.7
* `ff3cda4e` chore(deps): bump actions/checkout from 5.0.0 to 6.0.0
* `4f847c93` chore(deps): bump github/codeql-action from 4.31.2 to 4.31.4
* `259060ce` chore(deps): bump actions/dependency-review-action from 4.8.1 to 4.8.2
* `469363d9` chore(deps-dev): bump cypress from 15.6.0 to 15.7.0
* `ccc63b25` chore(deps): bump next-intl from 4.5.3 to 4.5.5
* `7cc279ad` chore(deps-dev): bump @types/react-dom from 19.2.2 to 19.2.3
* `b487edc0` chore(deps-dev): bump @biomejs/biome from 2.3.6 to 2.3.7
* `e3c0b8f9` chore(biome): Migrate agan the json spec
* `0da987a4` chore(biome): Migrate the json spec
* `6a2c6bf3` refactor(gridjs): Remove gridjs code and package
* `c0688c84` refactor(releases): Migrate search releases table to tanstack
* `64b9893f` refactor(usersmodal): Migrate users modal to tanstack
* `37c89aef` refactor(departments): Migrate departments table to tanstack
* `9216149d` refactor(bulkreleaseedit): Migrate bulk release edit table to tanstack
* `3a242e33` refactor(spdxattachments): Migrate spdx info attachments table to tanstack
* `41f21d7e` style: Add scrollable dropdown for package manager filter
* `e31b7d75` refactor(attachments): Migrate proposed attachment changes to tanstack
* `9dbcdd1a` refactor(Release): Filtered out releases except current
* `4da4fec2` refactor(Release): Refactored merge release overview table
* `1adbe7ea` chore(favicon): Update the favicon to SW360
* `1a2d6b78` refactor(CR): Added spinner while loading edit CR page
* `c7c5b6e3` refactor(CR): Added spinner while loading CR details
* `24c92d8e` refactor(dependencynetwork): Migrate dependency network tree view table to tanstack
* `ee56951f` refactor(components): Migrate component vulnerability tables to tanstack
* `7b7ec9d9` refactor(dependencynetwork): Migrate project dependency network table to tanstack
* `245b9931` chore(deps): bump step-security/harden-runner from 2.13.1 to 2.13.2
* `5b6c5452` chore(deps): bump softprops/action-gh-release from 2.4.1 to 2.4.2
* `2d839b38` chore(deps): bump docker/metadata-action from 5.8.0 to 5.9.0
* `cb89ce52` chore(deps-dev): bump @biomejs/biome from 2.3.2 to 2.3.4
* `1fb90e62` chore(deps): bump next-intl from 4.4.0 to 4.5.0
* `d2db4af4` chore(deps): bump html-react-parser from 5.2.7 to 5.2.8
* `a2d6f833` chore(deps-dev): bump cypress from 15.5.0 to 15.6.0
* `20bd2c4a` refactor(obligations): Migrate compare obligations table to tanstack
* `553c529b` refactor(licenseinfo): Migrate generate license info table to tanstack
* `525b980c` refactor(moderatoinrequests): Migrate proposed changes table to tanstack
* `1833d3f0` chore(deps): bump github/codeql-action from 4.31.0 to 4.31.2
* `9677b588` chore(deps): bump next-auth from 4.24.11 to 4.24.13
* `769957ed` chore(deps-dev): bump @biomejs/biome from 2.3.1 to 2.3.2
* `dfede1a5` chore(deps-dev): bump @types/node from 24.9.1 to 24.10.0
* `2d5ce376` refactor(obligations): Migrate release view obligations table to tanstack
* `cfd8fdaa` chore(deps): bump actions/upload-artifact from 4.6.2 to 5.0.0
* `4ec318da` chore(deps): bump actions/setup-node from 4 to 6
* `ae3d6fb8` chore(deps): bump github/codeql-action from 4.30.9 to 4.31.0
* `8c73243a` chore(deps-dev): bump lint-staged from 16.2.3 to 16.2.6
* `86c68d83` chore(deps-dev): bump @biomejs/biome from 2.2.6 to 2.3.1
* `a05f2be6` chore(deps): bump next-intl from 4.3.9 to 4.4.0
* `5c06a6b8` refactor(obligations): Migrate licensedb obligations to tanstack
* `aa105b8a` refactor(licensemodal): Migrate packages add main license modal to tanstack
* `a65ae99b` refactor(release): Migrate component release overview table to tanstack
* `3ebe5659` refactor(releases): Migrate release linked releases table to tanstack
* `f1fa1fa7` refactor(sourcecodebundle): Migrate generate source code bundle table to tanstack
* `900980dc` refactor(licenseobligations): Remove redundant code
* `e5119639` refactor(attachments): Migrate attachments table and remove redundant code
* `d8f73fc7` chore(ci): Unblock the build (attempt 2)
* `82c88802` refactor(releases): Migrate link project to a release modal table to tanstack
* `290950eb` chore(ci): Unblock the build
* `9d44bda7` refactor(linkreleasesmodal): Migrate link releases modal to tanstack
* `248466d1` refactor(linkedpackages): Migrate linked packages table to tanstack
* `3f2bd1fd` refactor(usermodal): Remove unused code
* `d2700059` refactor(linkprojects): Migrate link projects table to tanstack
* `48a5397c` refactor(linkprojects): Remove redundant hook for exact match
* `d014087d` refactor(linkpackages): Migrate link packages modal to tanstack
* `d0c1fbf7` refactor(releases): Migrate projects linked releases table to tanstack
* `a2d48006` chore(deps-dev): bump @types/node from 24.6.1 to 24.8.1
* `190d2cc4` chore(deps-dev): bump cypress from 15.3.0 to 15.5.0
* `33b415a0` chore(deps): bump github/codeql-action from 4.30.8 to 4.30.9
* `49e4401c` chore(deps): bump actions/setup-node from 5.0.0 to 6.0.0
* `f1524741` chore(deps): bump apache/skywalking-eyes from 0.7.0 to 0.8.0
* `e353c246` chore(deps): bump html-react-parser from 5.2.6 to 5.2.7
* `3355f3f1` chore(deps-dev): bump @biomejs/biome from 2.2.5 to 2.2.6
* `528cd773` refactor(licenses): Migrate edit whitelist and obligations table to tanstack
* `9e3566cd` chore(codeowners): Update current core commiters
* `aa9a4a17` refactor(licenses): Migrate release summary link licenses table to tanstack
* `5cd8b578` refactor(moderationrequests): Migrate bulk decline moderation requests table to tanstack
* `43125b86` chore(config): Use UI Config in components
* `30da8c68` refactor(resourceusing): Migrate resource using tables to tanstack
* `1f693336` refactor(licenses): Migrate linked obligations tables to tanstack
* `876f25a1` style(attachments): Highlight disabled Upload button to match active state
* `cd8bee91` refactor(tokens): Migrate tokens table to tanstack
* `65e02b83` refactor(requests): Migrate open moderation requests to tanstack
* `2f2221d0` refactor(requests): Migrate closed moderation requests to tanstack
* `e46f0afb` refactor(projects): Migrate license obligations table to tanstack
* `70f44544` refactor(attachmentusages): Migrate attachment usages table to tanstack
* `98cba513` refactor(requests): Migrate clearing request tables to tanstack
* `8bb4b164` chore(deps): bump github/codeql-action from 3.30.6 to 4.30.8
* `e031eb20` chore(deps): bump softprops/action-gh-release from 2.3.4 to 2.4.1
* `598564bb` chore(deps): bump actions/dependency-review-action from 4.8.0 to 4.8.1
* `da6f035c` chore(deps): bump pnpm/action-setup from 4.1.0 to 4.2.0
* `6a4bccef` refactor(projects): Migrate link projects table to tanstack
* `0eb65811` refactor(releases): Migratre linked releases table to tanstack
* `925f600b` refactor(ecc): Migrate projects ecc table to tanstack table
* `3b2e939b` refactor(vendordialog): Migrate vendor dialog to tanstack
* `0828c53e` refactor(packages): Migrate project linked packages table to tanstack
* `695877c5` refactor(obligations): Migrate obligation tabs to tanstack
* `40c72e28` refactor(packages): Migrate release linked packages table to tanstack
* `62233f2b` chore(deps): bump docker/login-action from 3.5.0 to 3.6.0
* `bec70cf0` chore(deps): bump github/codeql-action from 3.30.5 to 3.30.6
* `3a3f8620` chore(deps): bump softprops/action-gh-release from 2.3.3 to 2.3.4
* `34215fdb` chore(deps): bump ossf/scorecard-action from 2.4.2 to 2.4.3
* `2c6fea75` chore(deps-dev): bump eslint from 9.36.0 to 9.37.0
* `d6e313e0` chore(deps-dev): bump stylelint from 16.24.0 to 16.25.0
* `52ad7c0c` chore(deps-dev): bump @commitlint/cli from 20.0.0 to 20.1.0
* `e2903298` refactor(ecc): Migrate ecc table to tanstack
* `9b7f2759` chore(next): Bump nextjs version
* `242119e7` chore(deps-dev): bump eslint-config-next from 15.5.3 to 15.5.4
* `1d852880` refactor(releases): Migrate add releases table to tanstack
* `ccb3c44f` refactor(components): Migrate merge components to tanstack
* `4ba4f2bd` refactor(licensetypes): Migrate license types table to tanstack table
* `89210e3c` refactor(departments): Migrate secondary dept table to tanstack
* `5e7b86dc` refactor(sanitation): Migrate database sanitation tables to tanstack table
* `a22bf61d` refactor(obligations): Migrate obligations table to tanstack table
* `20754136` chore(deps): bump github/codeql-action from 3.30.3 to 3.30.5
* `0c34ac1e` chore(deps): bump actions/dependency-review-action from 4.7.3 to 4.8.0
* `74279f3c` chore(deps-dev): bump @commitlint/cli from 19.8.1 to 20.0.0
* `0923be2d` chore(deps-dev): bump @next/eslint-plugin-next from 15.5.3 to 15.5.4
* `84246826` refactor(vendor): Migrate vendors merge table to tanstack table
* `b6ae4983` refactor(users): Migrate users table to tanstack table
* `ec55b4e8` refactor(vendors): Migrate vendors table to tanstack table
* `598b38ed` chore(deps-dev): bump @typescript-eslint/typescript-estree
* `0b2dd4be` chore(deps-dev): bump eslint from 9.35.0 to 9.36.0
* `5f5a3825` chore(deps-dev): bump prettier-plugin-organize-imports
* `66467f0b` chore(deps-dev): bump @eslint/js from 9.35.0 to 9.36.0
* `7c0d4b4b` chore(deps): bump next-intl from 4.3.8 to 4.3.9
* `8159e74d` refactor(licenses): Migrate licenses table to tanstack table
* `97ed1127` refactor(licenseclearing): Migrate license clearing list view table to tanstack
* `e7f474b3` chore(deps): bump next-intl from 4.3.7 to 4.3.8 (#1020)
* `d9a6d930` chore(deps): bump step-security/harden-runner from 2.13.0 to 2.13.1
* `4eb28a79` chore(deps): bump github/codeql-action from 3.30.1 to 3.30.3
* `44c24dab` chore(deps): bump preact from 10.27.1 to 10.27.2
* `451588a5` chore(deps-dev): bump eslint-config-next from 15.5.2 to 15.5.3
* `8a7ea427` chore(deps-dev): bump @next/eslint-plugin-next from 15.5.2 to 15.5.3
* `239b6a94` chore(deps-dev): bump @types/node from 24.3.1 to 24.4.0
* `3cde029c` refactor(project): Migrate vulnerability tracking status table to tanstack table
* `8d9493ce` chore: Update to NextJS 15.5.x series
* `770116dc` chore: Restore next eslint linting
* `e6dac5ef` chore: Update base Node version to 24
* `fd40971f` refactor(search): Migrate search table to tanstack
* `8ebc3aa4` chore(deps-dev): bump @typescript-eslint/typescript-estree
* `edab83de` chore(deps): bump github/codeql-action from 3.29.11 to 3.30.1
* `58f2981f` chore(deps): bump actions/setup-node from 4.4.0 to 5.0.0
* `10069a1d` chore(deps): bump softprops/action-gh-release from 2.3.2 to 2.3.3
* `6681758b` chore(deps-dev): bump @eslint/js from 9.33.0 to 9.35.0
* `b0250695` chore(deps): bump preact from 10.27.0 to 10.27.1
* `3370576e` chore(deps-dev): bump bootstrap from 5.3.7 to 5.3.8
* `3dc8c746` chore(deps-dev): bump eslint-config-next from 15.4.6 to 15.5.2
* `49df6ca3` chore(deps-dev): bump @typescript-eslint/typescript-estree
* `9b3286d9` chore(deps): bump actions/dependency-review-action from 4.7.2 to 4.7.3
* `a553784e` chore(deps): bump next-intl from 4.3.4 to 4.3.5
* `26422f8a` chore(deps-dev): bump cypress from 14.5.4 to 15.0.0
* `c1189394` chore(deps): bump country-list from 2.3.0 to 2.4.1
* `3e9f4a1e` chore(deps): bump actions/dependency-review-action from 4.7.1 to 4.7.2
* `4cdc0e4f` chore(deps): bump github/codeql-action from 3.29.9 to 3.29.11
* `e50c69b4` chore(deps-dev): bump stylelint-config-standard from 38.0.0 to 39.0.0
* `ba789c4c` chore(deps-dev): bump @eslint/compat from 1.3.1 to 1.3.2
* `2344f2d6` chore(deps-dev): bump @typescript-eslint/typescript-estree
* `9a56378d` chore(deps-dev): bump @types/node from 24.0.13 to 24.3.0
* `c105e9d8` refactor(attachments): Project attachments table migrated to tanstack
* `6bbdfd32` refactor(vulnerability): Migrate project vulnerability table to tanstack table
* `5129bfe6` chore(deps): bump actions/checkout from 4.2.2 to 5.0.0
* `c5a164c8` chore(deps): bump github/codeql-action from 3.29.8 to 3.29.9
* `2146f7ed` chore(deps): bump html-react-parser from 5.2.5 to 5.2.6
* `0aaea9a2` chore(deps): bump preact from 10.26.9 to 10.27.0
* `bd52cb63` chore(deps-dev): bump typescript-eslint from 8.38.0 to 8.39.1
* `0de9b32c` chore(deps-dev): bump stylelint from 16.22.0 to 16.23.1
* `8ce89946` chore: Bump NextJS to 15.4.x series
* `6bcb4567` chore: Bump eslint and move country-list to runtime package
* `d9339ed3` chore(deps-dev): bump @eslint/js from 9.32.0 to 9.33.0
* `a2a28874` chore(deps): bump docker/login-action from 3.4.0 to 3.5.0
* `d426ea66` chore(deps): bump github/codeql-action from 3.29.4 to 3.29.8
* `b1ec9aeb` chore(deps-dev): bump eslint-config-next from 15.3.5 to 15.4.6
* `ff4d45e5` chore(deps-dev): bump cypress from 14.4.1 to 14.5.4
* `b417392b` chore(deps): bump docker/metadata-action from 5.7.0 to 5.8.0
* `4208acce` chore(deps-dev): bump @eslint/config-array from 0.20.0 to 0.21.0
* `42ea2c49` refactor(vulnerabilities): Migrate table to tanstack table
* `348af56d` refactor(components): Migrate table to tanstack table
* `f70d37bf` refactor(mytaskassignments): Migrate my task assignments table to tanstack table
* `f040ed6d` refactor(tasksubmissions): Migrate my task submissions table to tanstack table
* `8853c40d` refactor(licenseclearing): Remove multiple implementations of license clearing component
* `b047c9af` chore(deps-dev): bump @eslint/js from 9.31.0 to 9.32.0
* `9ba4714c` chore(deps-dev): bump typescript-eslint from 8.37.0 to 8.38.0
* `eb87bf1a` chore(deps): bump github/codeql-action from 3.29.2 to 3.29.4
* `24cf2717` chore(deps-dev): bump prettier-plugin-organize-imports
* `25b8e3c2` chore(deps): bump dotenv from 17.2.0 to 17.2.1
* `80bdd915` chore(deps-dev): bump eslint from 9.31.0 to 9.32.0
* `1ecaf188` chore(deps-dev): bump eslint from 9.28.0 to 9.31.0
* `e510c0a3` chore(deps): bump step-security/harden-runner from 2.12.2 to 2.13.0
* `463c8f8e` chore(deps): bump dotenv from 17.0.1 to 17.2.0
* `394a0fb5` chore(deps-dev): bump stylelint from 16.21.1 to 16.22.0
* `fc1290e5` chore(deps-dev): bump eslint-plugin-prettier from 5.5.1 to 5.5.3
* `2ab45115` chore(deps-dev): bump typescript-eslint from 8.35.1 to 8.37.0
* `6cef6c65` chore(deps-dev): bump @typescript-eslint/typescript-estree
* `0325cdda` chore(deps): bump softprops/action-gh-release from 2.2.1 to 2.3.2
* `dabfa3cf` chore(deps): bump next-intl from 4.3.1 to 4.3.4
* `70c92a73` chore(deps-dev): bump eslint-import-resolver-typescript
* `76350c4f` chore(deps-dev): bump @types/node from 24.0.1 to 24.0.13
* `a64a7d8a` chore(deps-dev): bump @eslint/js from 9.30.0 to 9.31.0
* `b6e5c94f` chore(deps-dev): bump eslint-config-next from 15.3.4 to 15.3.5
* `c929a335` chore(deps-dev): bump prettier from 3.6.0 to 3.6.2
* `de182c84` chore(deps-dev): bump stylelint from 16.21.0 to 16.21.1
* `47e14fca` chore(deps-dev): bump typescript-eslint from 8.34.1 to 8.35.1
* `68972210` chore(deps): bump dotenv from 17.0.0 to 17.0.1
* `6eca5ced` chore(deps): bump step-security/harden-runner from 2.12.1 to 2.12.2
* `61614fc3` chore(deps): bump github/codeql-action from 3.29.1 to 3.29.2
* `28ac8ddc` chore(SW360): Removed unused mockData dir

**Full Changelog**: https://github.com/eclipse-sw360/sw360-frontend/compare/v0.20.0-beta...v0.30.0-beta

## v0.20.0-beta

This was the first release as beta for the sw360-frontend project.

[v0.20.0-beta](https://github.com/eclipse-sw360/sw360-frontend/releases/tag/v0.20.0-beta)

## License

This program and the accompanying materials are made
available under the terms of the Eclipse Public License 2.0
which is available at https://www.eclipse.org/legal/epl-2.0/

SPDX-License-Identifier: EPL-2.0
