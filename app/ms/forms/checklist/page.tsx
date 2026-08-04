import HeaderNav from '../../../../components/common/HeaderNav';
import VendorChecklistForm from '../../../../components/forms/VendorChecklistForm';

export default function MalayChecklistPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HeaderNav currentLang="ms" />
      <main className="pb-16">
        <VendorChecklistForm lang="ms" />
      </main>
    </div>
  );
}
