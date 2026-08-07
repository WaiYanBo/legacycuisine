import HeaderNav from '../../../../components/common/HeaderNav';
import MerchantChecklistForm from '../../../../components/forms/MerchantChecklistForm';

export default function MalayChecklistPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HeaderNav currentLang="ms" />
      <main className="pb-16">
        <MerchantChecklistForm lang="ms" />
      </main>
    </div>
  );
}
