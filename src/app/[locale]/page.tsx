// import { getServerSession } from 'next-auth';
// import { auth } from '@/lib/auth';
import Index from './Index';

export default async function IndexPage() {
  // const session = await getServerSession(auth);
  return <Index />;
}
