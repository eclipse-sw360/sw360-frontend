// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import AuthScreen from '@/components/auth-screen/AuthScreen';
import { Metadata } from 'next';
import { Session } from '@/object-types/Session';

export const metadata: Metadata = {
  title: 'Welcome - SW360',
};

export default async function AuthPage() {
  const session: Session = await getServerSession(authOptions);
  return <AuthScreen session={session} />;
}
