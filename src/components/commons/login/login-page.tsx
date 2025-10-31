"use client";
import { LoginForm } from "./login-form";
import { LoginHero } from "./login-hero";

export function LoginPage() {
  return (
    <main className="min-h-screen flex">
      {/* Left side - Hero section */}
      <LoginHero />

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
