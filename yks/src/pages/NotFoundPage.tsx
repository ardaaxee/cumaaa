import { PageHeader } from '../components/Layout';
import { Empty } from '../components/ui';

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Sayfa bulunamadı" />
      <Empty title="Aradığın sayfa yok." action={<a className="btn primary" href="#/">Ana sayfaya dön</a>} />
    </>
  );
}
