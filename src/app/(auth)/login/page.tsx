"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <>
      <h1 className="font-serif text-2xl font-medium text-stone-900">
        Log in to Syllaplan
      </h1>
      <form action={action} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
            Email
          </label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
            Password
          </label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-stone-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-clay-600 hover:text-clay-700">
          Sign up
        </Link>
      </p>
    </>
  );
}
