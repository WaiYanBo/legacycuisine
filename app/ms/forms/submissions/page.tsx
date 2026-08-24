'use client';

import HeaderNav from '../../../../components/common/HeaderNav';
import SubmissionsViewer from '../../../../components/forms/SubmissionsViewer';

export default function MalaySubmissionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <HeaderNav currentLang="ms" />
      <main className="py-8 px-4 sm:px-6">
        <SubmissionsViewer lang="ms" />
      </main>
    </div>
  );
}
