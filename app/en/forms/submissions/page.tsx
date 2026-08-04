import HeaderNav from '../../../../components/common/HeaderNav';
import SubmissionsViewer from '../../../../components/forms/SubmissionsViewer';

export default function EnglishSubmissionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HeaderNav currentLang="en" />
      <main className="pb-16">
        <SubmissionsViewer lang="en" />
      </main>
    </div>
  );
}
