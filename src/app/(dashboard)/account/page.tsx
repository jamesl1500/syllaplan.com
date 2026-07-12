import { verifySession, getProfile } from "@/lib/dal";
import { ProfileForm } from "@/components/account/ProfileForm";
import { EmailForm } from "@/components/account/EmailForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import { DeleteAccountForm } from "@/components/account/DeleteAccountForm";

function Section({
  title,
  children,
  danger = false,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border p-6 shadow-sm shadow-stone-900/5 ${
        danger ? "border-red-200 bg-red-50" : "border-stone-200 bg-white"
      }`}
    >
      <h2
        className={`mb-4 text-sm font-semibold uppercase tracking-wide ${
          danger ? "text-red-700" : "text-stone-500"
        }`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function AccountPage() {
  const { user } = await verifySession();
  const profile = await getProfile();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-medium text-stone-900">Account settings</h1>
        <p className="mt-1 text-sm text-stone-600">
          Manage your profile, login, and account.
        </p>
      </div>

      <Section title="Profile">
        <ProfileForm displayName={profile.display_name ?? ""} />
      </Section>

      <Section title="Email">
        <EmailForm email={user.email ?? ""} emailConfirmed={!!user.email_confirmed_at} />
      </Section>

      <Section title="Password">
        <PasswordForm />
      </Section>

      <Section title="Danger zone" danger>
        <DeleteAccountForm />
      </Section>
    </div>
  );
}
