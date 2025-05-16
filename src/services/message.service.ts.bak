// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Message, MessageOptions } from '@/object-types'
import { Observable, Subject } from 'rxjs'
import { filter } from 'rxjs/operators'

const MessageType = {
    Success: 'success',
    Error: 'danger',
    Info: 'info',
    Warning: 'warning',
}

const messageSubject = new Subject<Message>()
const defaultId = 'default-message'

// enable subscribing to messages observable
function enableSubscribing(id = defaultId): Observable<Message> {
    return messageSubject.asObservable().pipe(filter((x: Message) => x.id === id))
}

// convenience methods
function success(message: string, options?: MessageOptions): void {
    showMessage(MessageType.Success, message, 'Success', options)
}

function error(message: string, options?: MessageOptions): void {
    showMessage(MessageType.Error, message, 'Error', options)
}

function info(message: string, options?: MessageOptions): void {
    showMessage(MessageType.Info, message, 'Info', options)
}

function warn(message: string, options?: MessageOptions): void {
    showMessage(MessageType.Warning, message, 'Warning', options)
}

function showMessage(type: string, text: string, lead: string, options?: MessageOptions): void {
    const message: Message = {
        id: options && options.id != null ? options.id : defaultId,
        type: type,
        lead: lead,
        text: text,
        autoClose: options && (options.autoClose ?? false) ? options.autoClose : true,
        keepAfterRouteChange: options?.keepAfterRouteChange ?? true,
    }

    messageSubject.next(message)
}

function clear(id = defaultId): void {
    messageSubject.next({ id })
}

const MessageService = {
    enableSubscribing,
    success,
    error,
    info,
    warn,
    showMessage,
    clear,
}

export default MessageService
