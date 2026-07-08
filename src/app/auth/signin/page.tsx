"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";

export default function SignIn() {
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl") ?? "/";
  const callbackUrl = (() => {
    if (!rawCallbackUrl || rawCallbackUrl === "undefined") {
      return "/";
    }

    try {
      const parsed = new URL(rawCallbackUrl, window.location.origin);
      if (["0.0.0.0", "::", "::1"].includes(parsed.hostname)) {
        return "/";
      }
      return `${parsed.pathname}${parsed.search}`;
    } catch {
      return rawCallbackUrl.startsWith("http") ? "/" : rawCallbackUrl;
    }
  })();
  const error = searchParams.get("error");
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("123456789");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentialError, setCredentialError] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    await signIn(provider, { callbackUrl });
  };

  const handleCredentialsSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setCredentialError(null);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.ok) {
      window.location.href = callbackUrl;
      return;
    }

    setCredentialError("Invalid credentials. Please try admin / 123456789.");
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
          {(error || credentialError) && (
            <div
              className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
              role="alert"
            >
              <span className="block sm:inline">
                {credentialError ?? "Authentication error. Please try again."}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-3" onSubmit={handleCredentialsSignIn}>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email or username
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-950"
                placeholder="admin"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-950"
                placeholder="123456789"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in locally"}
            </Button>
          </form>

          <div className="flex items-center gap-2 text-center text-sm text-gray-500">
            <div className="h-px flex-1 bg-gray-300" />
            <span>or</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <Button
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={() => handleSignIn("google")}
          >
            <FaGoogle className="h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Temporary local account: admin / 123456789
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
