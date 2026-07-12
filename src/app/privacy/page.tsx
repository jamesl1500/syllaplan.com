import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your data.`,
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col bg-cream">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-4xl font-medium tracking-tight text-stone-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: July 12, 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-stone-700">
          <Section title="What we collect">
            <p>
              When you create an account, we collect your email address, password (handled entirely by our
              authentication provider — we never see or store it in plain text), and an optional display name.
              When you upload a syllabus, we store the PDF file and the schedule, exam dates, and assignments
              extracted from it.
            </p>
          </Section>

          <Section title="How your syllabus is processed">
            <p>
              When you upload a syllabus PDF, it's sent to Anthropic's Claude API so it can read the document
              and extract your class schedule, dates, and assignments. Nothing is saved to your calendar
              automatically — you review and confirm the extracted information yourself before it's stored.
            </p>
          </Section>

          <Section title="Who can see your data">
            <p>
              Your classes, calendar, tasks, and uploaded files are private to your account. We don't share
              your data with other students, and we don't sell your data to anyone.
            </p>
          </Section>

          <Section title="Where your data lives">
            <p>
              Your account data is stored in a Postgres database and file storage provided by Supabase, with
              row-level security policies that restrict every row and file to its owner. Only you can read your
              own classes, schedules, and syllabus files.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              We use a session cookie to keep you signed in. We don't use advertising or third-party tracking
              cookies.
            </p>
          </Section>

          <Section title="Deleting your data">
            <p>
              You can delete your account at any time from account settings. Doing so permanently deletes your
              profile, classes, calendar events, tasks, and uploaded syllabus files — this cannot be undone.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If this policy changes in a way that affects how your data is handled, we'll update this page and
              change the date above.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy? Reach out at{" "}
              <a href="mailto:hello@jameslatten.com" className="font-medium text-clay-600 hover:text-clay-700">
                hello@jameslatten.com
              </a>
              .
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 font-serif text-xl font-medium text-stone-900">{title}</h2>
      <div className="leading-relaxed text-stone-600">{children}</div>
    </section>
  );
}
