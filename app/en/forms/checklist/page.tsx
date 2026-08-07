import HeaderNav from '../../../../components/common/HeaderNav';
import MerchantChecklistForm from '../../../../components/forms/MerchantChecklistForm';

export default function EnglishChecklistPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HeaderNav currentLang="en" />
      <main className="pb-16">
        <MerchantChecklistForm lang="en" />
      </main>
    </div>
  );
}
