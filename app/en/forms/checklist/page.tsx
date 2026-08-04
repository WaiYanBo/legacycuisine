import HeaderNav from '../../../../components/common/HeaderNav';
import VendorChecklistForm from '../../../../components/forms/VendorChecklistForm';

export default function EnglishChecklistPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HeaderNav currentLang="en" />
      <main className="pb-16">
        <VendorChecklistForm lang="en" />
      </main>
    </div>
  );
}
