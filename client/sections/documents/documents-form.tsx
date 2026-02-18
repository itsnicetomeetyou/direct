'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createDocument, updateDocument } from '@/server/document';
import { uploadToCloudinary } from '@/server/kiosk';
import { useRef, useState } from 'react';
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
import { Upload, X, FileText } from 'lucide-react';
import Image from 'next/image';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
  price: z.number().min(0, {
    message: 'Price must be at least 0 pesos.'
  }),
  isAvailable: z.boolean(),
  eligibility: z.enum(['STUDENT', 'GRADUATED', 'BOTH']),
  dayBeforeRelease: z.number().min(0, {
    message: 'Must be 0 or more days.'
  })
});

export default function DocumentsForm(data: Partial<Document>) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sampleDocsUrl, setSampleDocsUrl] = useState<string | null>(data.sampleDocs ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(data.sampleDocs ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data.name || '',
      price: data.price || 0,
      isAvailable: data.isAvailable || false,
      eligibility: data.eligibility || 'BOTH',
      dayBeforeRelease: data.dayBeforeRelease ?? 3
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return toast({
        title: 'Invalid file type',
        description: 'Please upload an image (JPG, PNG, WebP) or PDF file.',
        variant: 'destructive'
      });
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast({
        title: 'File too large',
        description: 'File must be less than 5MB.',
        variant: 'destructive'
      });
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSampleDocsUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function uploadFile(): Promise<string | null> {
    if (!selectedFile) return sampleDocsUrl;
    const formData = new FormData();
    formData.append('sampleDocs', selectedFile);
    const result = await uploadToCloudinary(formData);
    if (!result?.secure_url) {
      throw new Error('Upload succeeded but no URL was returned.');
    }
    return result.secure_url;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const uploadedUrl = await uploadFile();
      const response = await createDocument({
        name: values.name,
        price: values.price.toString(),
        isAvailable: values.isAvailable.toString(),
        eligibility: values.eligibility,
        sampleDocs: uploadedUrl,
        dayBeforeRelease: values.dayBeforeRelease
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
        const uploadedUrl = await uploadFile();
        const response = await updateDocument(data.id, {
          name: values.name,
          price: values.price.toString(),
          isAvailable: values.isAvailable.toString(),
          eligibility: values.eligibility,
          sampleDocs: uploadedUrl,
          dayBeforeRelease: values.dayBeforeRelease
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

              <FormField
                control={form.control}
                name="dayBeforeRelease"
                disabled={isLoading}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Days Advance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={365}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Minimum business days before this document can be scheduled for pickup/delivery
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel>Sample Document</FormLabel>
              <p className="mb-2 text-sm text-muted-foreground">
                Upload a sample image of the document (JPG, PNG, WebP, or PDF). Max 5MB.
              </p>

              {(previewUrl || (sampleDocsUrl && !selectedFile)) ? (
                <div className="relative inline-block">
                  {(previewUrl || sampleDocsUrl)?.match(/\.pdf$/i) ? (
                    <div className="flex h-48 w-48 flex-col items-center justify-center rounded-lg border bg-muted/30">
                      <FileText className="mb-2 h-12 w-12 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">PDF Document</span>
                    </div>
                  ) : (
                    <Image
                      src={previewUrl || sampleDocsUrl || ''}
                      alt="Sample document preview"
                      width={192}
                      height={192}
                      className="h-48 w-48 rounded-lg border object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50"
                >
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Click to upload sample document</span>
                  <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, WebP, or PDF</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : !data.id ? 'Submit' : 'Update'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
