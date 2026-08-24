'use client';

import HeaderNav from '../../../../components/common/HeaderNav';
import MerchantChecklistForm from '../../../../components/forms/MerchantChecklistForm';

export default function MalayChecklistPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <HeaderNav currentLang="ms" />
      <main className="py-8 px-4 sm:px-6">
        <MerchantChecklistForm lang="ms" />
      </main>
    </div>
  );
}
