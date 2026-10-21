'use client'
import { Loader2, Lock } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useForm, SubmitHandler } from 'react-hook-form';
import z from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner'

const loginFormSchema = z.object({
  email: z
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
});

type loginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginCard() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<loginFormValues>({
    resolver: zodResolver(loginFormSchema)
  });


  async function onSubmit(data: loginFormValues) {
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: '/admin',
    })

    if (error) {
      toast.error(error.message ?? 'Failed to sign in. Please try again.')
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 sm:py-28">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="h-6 w-6" />
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Authenticate to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register('email')}
                aria-invalid={!!errors.email}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                aria-invalid={!!errors.password}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
