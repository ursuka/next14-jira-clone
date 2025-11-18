import { getCurrent } from '@/features/auth/queries';
import SignInCard from '@/features/auth/components/sign-in-card'
import { redirect } from 'next/navigation';
import React, { FC } from 'react'

const SignInPage: FC = async () => {
  const user = await getCurrent();

  if (user) redirect('/');

  return (
    <SignInCard />
  )
}

export default SignInPage