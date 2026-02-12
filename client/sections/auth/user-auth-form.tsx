'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string()
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const defaultValues = {
    email: '',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const { toast } = useToast();
  const router = useRouter();

  const onSubmit = async (data: UserFormValue) => {
    try {
      setIsLoading(true);
      const response = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: callbackUrl ?? '/dashboard'
      });
      if (response?.code) {
        setIsLoading(false);
        return toast({
          title: 'Sign in failed',
          description: 'Please check your email and password',
          variant: 'destructive'
        });
      }
      if (!response?.error && response?.url) {
        setIsLoading(false);
        toast({
          title: 'Sign in success',
          description: 'Redirecting...'
        });
        return router.push(response.url);
      }
      setIsLoading(false);
      return toast({
        title: 'Something went wrong',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } catch (err) {
      if (err instanceof Error) {
        setIsLoading(false);
        return toast({
          title: 'Something went wrong',
          description: err.message,
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email..." disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password..." disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isLoading} className="ml-auto w-full" type="submit">
            Login
          </Button>
        </form>
      </Form>
      {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <GithubSignInButton /> */}
    </>
  );
}
