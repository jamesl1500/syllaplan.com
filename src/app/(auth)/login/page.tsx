import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Syllaplan to see your class calendars and tasks.",
};

export default function LoginPage() {
  return <LoginForm />;
}
