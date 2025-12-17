// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { usePathname } from 'next/navigation'
import { type JSX, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-bootstrap'
import { BsCheck2Circle, BsInfoCircle } from 'react-icons/bs'
import { Message } from '@/object-types'
import MessageService from '@/services/message.service'
import { CommonUtils } from '@/utils'

interface Props {
    id?: string
}

const MessageIcon = ({ messageType }: { messageType: string | undefined }) => {
    switch (messageType) {
        case 'success':
            return <BsCheck2Circle size={20} />
        case 'danger':
            return <BsInfoCircle size={20} />
        default:
            return <BsInfoCircle size={20} />
    }
}

function GlobalMessages({ id = 'default-message' }: Props): JSX.Element {
    const pathname = usePathname()
    const autoCloseTime = 7000
    const mounted = useRef(false)
    const [messages, setMessages] = useState<Array<Message>>([])

    useEffect(() => {
        mounted.current = true
        // subscribe to new message notifications
        const subscription = MessageService.enableSubscribing(id).subscribe((message) => {
            // clear message when an empty text is received
            if (CommonUtils.isNullEmptyOrUndefinedString(message.text)) {
                setMessages((messages) => {
                    // filter out messages without 'keepAfterRouteChange' flag
                    const filteredMessages = messages.filter((m) => m.keepAfterRouteChange === true)

                    // remove 'keepAfterRouteChange' flag on the rest
                    return omit(filteredMessages, 'keepAfterRouteChange')
                })
            } else {
                // add message to array with unique id
                message.itemId = Math.random()
                setMessages((messages) => [
                    ...messages,
                    message,
                ])

                // auto close message if required
                if (message.autoClose === true) {
                    setTimeout(() => removeMessage(message), autoCloseTime)
                }
            }
        })

        // clean up function that runs when the component unmounts
        return () => {
            mounted.current = false

            // unsubscribe to avoid memory leaks
            subscription.unsubscribe()
            MessageService.clear(id)
        }
    }, [
        pathname,
    ])

    function omit(arr: Array<Message>, key: keyof Message) {
        return arr.map((obj: Message) => {
            return {
                ...obj,
                [key]: undefined,
            }
        })
    }

    function removeMessage(message: Message) {
        if (!mounted.current) return
        setMessages((messages) => messages.filter((m) => m.itemId !== message.itemId))
    }

    return (
        <div className='global-message'>
            {messages.map((message, index) => (
                <Alert
                    key={index}
                    variant={message.type}
                    onClose={() => removeMessage(message)}
                    dismissible
                >
                    <span>
                        <MessageIcon messageType={message.type} /> <strong>{message.lead}: </strong>
                        {message.text}
                    </span>
                </Alert>
            ))}
        </div>
    )
}

export default GlobalMessages
