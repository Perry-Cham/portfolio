import LoginCard from '@/components/login/login-card';
import SignUpCard from '@/components/login/sign-up-card';
import { Suspense } from 'react';
import { db } from '@/lib/db';
export default async function LoginPage() {
  const result = await checkIfFirstAcc();
  return <Suspense>
    <section>{result ? <LoginCard /> : <SignUpCard />}</section>
  </Suspense>;
}

async function checkIfFirstAcc() {
  const accounts = await db.user.count();
  console.log(accounts);

  if (accounts) {
    return true;
  } else {
    return false;
  }
}
