import { cn } from "@components/lib/utils"
import { Button } from "@components/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/components/ui/card"
import { signIn } from "auth-astro/client"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto", className)} {...props}>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Enter Workspace
          </CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            Log in to access personalized features and project repositories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {/* Tombol Google */}
            <Button
              variant="outline"
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-2 h-11 transition-colors cursor-pointer"
            >
              <svg className="h-5 w-5" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
              </svg>
              Continue with Google
            </Button>

            {/* Tombol GitHub */}
            <Button
              variant="outline"
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-2 h-11 transition-colors cursor-pointer"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
              Continue with GitHub
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Text */}
      <div className="px-6 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
          Privacy Policy
        </a>.
      </div>
    </div>
  )
}