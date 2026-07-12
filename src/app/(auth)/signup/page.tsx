import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a free Syllaplan account and turn your first syllabus into a calendar.",
};

export default function SignupPage() {
  return <SignupForm />;
}
