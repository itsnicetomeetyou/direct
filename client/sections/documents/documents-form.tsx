'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createDocument, updateDocument } from '@/server/document';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Document } from '@/constants/data';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { EligibilityStatus } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
  price: z.number().min(0, {
    message: 'Price must be at least 0 pesos.'
  }),
  isAvailable: z.boolean(),
  eligibility: z.enum(['STUDENT', 'GRADUATED', 'BOTH'])
});

export default function DocumentsForm(data: Partial<Document>) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data.name || '',
      price: data.price || 0,
      isAvailable: data.isAvailable || false,
      eligibility: data.eligibility || 'BOTH'
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const response = await createDocument({
        name: values.name,
        price: values.price.toString(),
        isAvailable: values.isAvailable.toString(),
        eligibility: values.eligibility
      });
      if (response.id) {
        setIsLoading(false);
        router.push('/dashboard/documents');
        router.refresh();
        return toast({
          title: 'Document added successfully',
          description: 'Document has been added to the database'
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        setIsLoading(false);
        console.log(err);
        return toast({
          title: 'Something went wrong',
          description: err.message,
          variant: 'destructive'
        });
      }
    }
  }

  async function onUpdate(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      if (data.id) {
        const response = await updateDocument(data.id, {
          name: values.name,
          price: values.price.toString(),
          isAvailable: values.isAvailable.toString(),
          eligibility: values.eligibility
        });
        if (response.id) {
          setIsLoading(false);
          router.push('/dashboard/documents');
          router.refresh();
          return toast({
            title: 'Document updated successfully',
            description: 'Document has been updated in the database'
          });
        }
      }
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
  }

  return (
    <Card className="mx-auto w-full">
      <CardHeader>
        <CardTitle className="text-left text-2xl font-bold">Document Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(!data.id ? onSubmit : onUpdate)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                disabled={isLoading}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                disabled={isLoading}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-muted-foreground">₱</span>
                        </div>
                        <Input
                          id="currency"
                          type="number"
                          min={0}
                          max={10000}
                          step={0.01}
                          className="pl-9"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAvailable"
                disabled={isLoading}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Status</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          onBlur={field.onBlur}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eligibility"
                disabled={isLoading}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligibility Status</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select eligibility status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Eligibility Status</SelectLabel>
                            {Object.values(EligibilityStatus).map((status, index) => (
                              <SelectItem key={index} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit">{!data.id ? 'Submit' : 'Update'}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
