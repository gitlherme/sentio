import SignIn from "@/components/auth/sign-in";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome to Habits Todo</h1>
        <p className="text-muted-foreground">Please sign in to continue</p>
        <SignIn />
      </div>
    </div>
  );
}
