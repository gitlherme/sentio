"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function SignIn() {
  return (
    <Button
      onClick={async () => {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/", // Redirect after login
        });
      }}
    >
      Sign in with Google
    </Button>
  );
}
