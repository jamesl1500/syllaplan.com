import Link from "next/link";
import { MailCheck } from "lucide-react";
import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-clay-50 text-clay-600">
        <MailCheck className="h-6 w-6" />
      </div>
      <h1 className="mt-4 font-serif text-2xl font-medium text-stone-900">Verify your email</h1>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">
        We sent a verification link
        {email ? (
          <>
            {" "}
            to <span className="font-medium text-stone-900">{email}</span>
          </>
        ) : (
          " to your inbox"
        )}
        . Click it to confirm your email address before logging in.
      </p>

      {email && (
        <div className="mt-6">
          <ResendVerificationButton email={email} />
        </div>
      )}

      <p className="mt-6 text-sm text-stone-600">
        Already verified?{" "}
        <Link href="/login" className="font-medium text-clay-600 hover:text-clay-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
