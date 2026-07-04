import { redirect } from "next/navigation";
import { SignIn } from "@clerk/nextjs";

export default function LogInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    redirect("/mission-control");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#E07A5F",
            colorBackground: "#FFFFFF",
            borderRadius: "0.75rem",
          },
        }}
      />
    </div>
  );
}