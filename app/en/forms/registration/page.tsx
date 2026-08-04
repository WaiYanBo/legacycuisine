import HeaderNav from '../../../../components/common/HeaderNav';
import BusinessRegistrationForm from '../../../../components/forms/BusinessRegistrationForm';

export default function EnglishRegistrationPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HeaderNav currentLang="en" />
      <main className="pb-16">
        <BusinessRegistrationForm lang="en" />
      </main>
    </div>
  );
}
