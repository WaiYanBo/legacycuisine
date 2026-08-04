import HeaderNav from '../../../../components/common/HeaderNav';
import SubmissionsViewer from '../../../../components/forms/SubmissionsViewer';

export default function MalaySubmissionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HeaderNav currentLang="ms" />
      <main className="pb-16">
        <SubmissionsViewer lang="ms" />
      </main>
    </div>
  );
}
