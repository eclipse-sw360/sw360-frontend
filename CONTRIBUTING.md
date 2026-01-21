# SW360 Frontend project contributing guide

This is your first stop to contribute to SW360 Frontend project. From here you will find an overview of our contribution workflow.

Please read our code [Code of Conduct](./CODE_OF_CONDUCT.md) before to help with the well being of the community.

## New contributor guide

To get an overview of the project, read the [README](./README.md).

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification to commit messages and [Apache Skywalking](https://github.com/apache/skywalking-eyes) for check the license headers.
Translations can be verified and executed in automated way using [Libre Translate project](https://libretranslate.com/)

### Setting up

It is recommended for easy development start usage of VSCode and Docker. A developer container setup is included and the entire setup is done after the devcontainer build.

If you intend to do in a local environment by yourself, the base requirements are pretty baseic, NodeJS LTS version and an editor of your choice. Then run:

```bash
> npm install -G pnpm
```

### Running test environment

We are assuming that you have some connection to an SW360 instance to test, so add the following `.env` configuration on the root of your repository clone:

```ini
# sw360-frontend/.env
NEXT_PUBLIC_SW360_API_URL = ${SW360_API_URL}   (e.g 'http://localhost:8080')
NEXTAUTH_SECRET = _any string_ (next auth secret key)
NEXTAUTH_URL = 'http://localhost:3000'
```

Then run:

```bash
> pnpm run dev
```

If everything went well, the localhost port 3000 will be opened in your host and you will able to access the app at the following address:

```bash
http://localhost:3000
```

### Source license headers and copyrights

Every file need to have the conformant license headers. To do that:

- Add this on the header of your source

```typescript
// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE
```

- Add your copyright on thr NOTICE file

If you want to check your code before push to CI is possible with docker. Just execute this command from the root of the projects:

```bash
> docker run -it --rm -v $(pwd):/github/workspace ghcr.io/apache/skywalking-eyes/ license-eye header check
```

### Commits

All commits are expected to be signed. [Here's Github documentation about signing commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits).

Commit header should follow convetional commits format, with type(info): message

Example:

`fix(project): Broken something and fixed`

Types allowed for this project commit:

- **build** - For buildsystem related commits
- **chore** - For small commit tasks
- **ci** - For CI related commits
- **docs** - For documentation related tasks
- **feat** - For new features commits
- **fix** - For code fix commits
- **perf** - Performance related commits
- **refactor** - For refactoring related commits
- **revert** - For revert commits
- **style** - For layout and styling commits
- **test** - For test related commits

Any other header will be caught on CI, and build will fail.

## Project Rules

- You shall never try to commit package managers lock file
- You shall never try to commit image files except as SVG
- You shall use NPM. Yarn and pnpm are as good, but we need deal with one only. You can use on your dev environment, but the default reference for testing is npm
- You shall NEVER remove the copytright lines from NOTICE unless you are the owner

## Icons

To ensure visual harmony and immediate recognition, we primarily use a predefined set of icons for common actions and concepts. Please prioritize using these icons whenever their meaning aligns with your feature.

Here's a list of commonly used icons and their intended contexts:

*   **`BsPencil`**: Editing items, records, or content.
*   **`BsFillTrashFill`**: Deleting items, records, or content.
*   **`BsXCircle`**: Canceling an action, closing a modal/dialog, or dismissing a notification.
*   **`BsQuestionCircle`**: Indicating help, providing more information, or linking to FAQs.
*   **`BsUpload`**: Initiating the upload of files or documents.
*   **`BsDownload`**: Initiating the download of files or data.
*   **`BsCaretDownFill`**: Expanding/collapsing sections, indicating a dropdown menu.
*   **`BsCaretRightFill`**: Navigating forward, expanding/collapsing sub-sections.
*   **`BsClipboard`**: Copying content to the clipboard.
*   **`BsCheck2Square`**: Marking a task as complete, indicating a checked state in a list.
*   **`BsPeopleFill`**: Representing user management, user lists, or groups.
*   **`BsFiles`**: Managing user-related documents, roles, or complex configurations.
*   **`BsGit`**: Merging code branches, data sets, or configurations.
*   **`BsArrowLeft`**: Navigating back to a previous page or step.
*   **`BsArrowCounterclockwise`**: Reverting the last action.
*   **`BsCheck2`**: General confirmation, selection, or a small indicator of success.
*   **`BsLink45Deg`**: Creating or indicating an external or internal link.
*   **`BsInfoCircle`**: Providing contextual information or details.
*   **`BsArrowRight`**: Navigating forward to the next page or step.
*   **`BsXCircle`**: Clearing input fields, removing an item from a selection. (Note: Also used for 'Cancel' depending on context.)
*   **`BsCheck2Circle`**: Indicating successful completion, a selected state, or validation.
*   **`BsExclamationTriangle`**: Highlighting warnings, caution, or important alerts.
*   **`BsArrowRepeat`**: Refreshing data, content, or a page.
*   **`BsFileEarmarkFill`**: Representing a generic document or file.
*   **`BsPLusLg`**: Adding a new item, expanding a section, or creating a new entry.
*   **`BiSort`**: General sorting action. (Note: For specific ascending/descending, please refer to the dedicated icons below.)
*   **`BsSortDown`**: Sorting data in ascending order (e.g., A-Z, 1-9).
*   **`BsSortDownAlt`**: Sorting data in descending order (e.g., Z-A, 9-1).
*   **`BsSun`**: Toggling the application theme to light mode.
*   **`BsSunFill`**: Toggling the application theme to dark mode.

When an existing standardized icon doesn't quite fit the need for a new feature or concept, you might need to introduce a new icon. Please use icons of class ``` Bootstrap icons ``` from the library react-icons.

Please keep the size of all icons to 20 for style consistency.

