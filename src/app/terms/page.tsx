import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms for using ${siteConfig.name}.`,
};

export default function TermsPage() {
  return (
    <div className="flex flex-1 flex-col bg-cream">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="text-4xl font-medium tracking-tight text-stone-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-stone-500">Last updated: July 12, 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-stone-700">
          <Section title="Using Syllaplan">
            <p>
              Syllaplan lets you upload a syllabus PDF and turns it into a calendar and task list for that
              class. You're responsible for reviewing the extracted schedule, dates, and assignments before
              confirming them — we don't guarantee the AI extraction is error-free.
            </p>
          </Section>

          <Section title="Your account">
            <p>
              You're responsible for keeping your login credentials secure and for the accuracy of the
              information you provide. You must be old enough to consent to our Privacy Policy in your
              jurisdiction to create an account.
            </p>
          </Section>

          <Section title="Your content">
            <p>
              You own the syllabus files and course information you upload. By uploading a syllabus, you
              confirm you have the right to use it with a service that processes it via a third-party AI
              model to extract schedule information on your behalf.
            </p>
          </Section>

          <Section title="Acceptable use">
            <p>
              Don't use Syllaplan to upload content you don't have rights to, to abuse or overload the
              service, or to attempt to access another user's data.
            </p>
          </Section>

          <Section title="No warranty">
            <p>
              Syllaplan is provided &ldquo;as is,&rdquo; without warranties of any kind. Extracted dates and
              assignments may be incomplete or incorrect — always cross-check anything important, like exam
              dates, against your official syllabus.
            </p>
          </Section>

          <Section title="Limitation of liability">
            <p>
              To the fullest extent permitted by law, Syllaplan and its operator aren't liable for any
              indirect, incidental, or consequential damages arising from your use of the service, including
              missed deadlines or exams.
            </p>
          </Section>

          <Section title="Account deletion">
            <p>
              You may delete your account at any time from account settings, which permanently removes your
              data. We may also suspend or terminate accounts that violate these terms.
            </p>
          </Section>

          <Section title="Changes to these terms">
            <p>
              We may update these terms from time to time. Continued use of Syllaplan after a change means you
              accept the updated terms.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about these terms? Reach out at{" "}
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
