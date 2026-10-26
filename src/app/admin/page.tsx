import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/admin');
  }

  return <AdminDashboard userName={session.user.name} />;
}
