'use client';

import HeaderNav from '../../../../components/common/HeaderNav';
import BusinessRegistrationForm from '../../../../components/forms/BusinessRegistrationForm';

export default function EnglishRegistrationPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <HeaderNav currentLang="en" />
      <main className="py-8 px-4 sm:px-6">
        <BusinessRegistrationForm lang="en" />
      </main>
    </div>
  );
}
