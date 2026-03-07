import { redirect } from 'next/navigation';

export default function DocsRootPage() {
    // Redirect first visit to the first documentation page
    redirect('/docs/especificacao/o-que-e-streamshare');
}
