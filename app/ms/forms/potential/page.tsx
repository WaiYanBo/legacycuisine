'use client';

import HeaderNav from '../../../../components/common/HeaderNav';
import PotentialClientForm from '../../../../components/forms/PotentialClientForm';

export default function MalayPotentialClientPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <HeaderNav currentLang="ms" />
      <main className="py-4 sm:py-8 px-2 sm:px-6 print:py-0 print:px-0">
        <PotentialClientForm lang="ms" />
      </main>
    </div>
  );
}
