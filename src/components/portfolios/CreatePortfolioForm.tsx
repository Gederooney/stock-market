'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePortfolio } from '@/hooks/usePortfolios';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function CreatePortfolioForm() {
  const router = useRouter();
  const createPortfolio = useCreatePortfolio();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const portfolio = await createPortfolio.mutateAsync(data);
      router.push(`/portfolios/${portfolio.id}`);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio Name</FormLabel>
              <FormControl>
                <Input placeholder="My Investment Portfolio" {...field} />
              </FormControl>
              <FormDescription>
                Choose a memorable name for your portfolio
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Long-term growth stocks focused on technology sector..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add notes about your investment strategy or goals
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={createPortfolio.isPending}
          >
            {createPortfolio.isPending ? 'Creating...' : 'Create Portfolio'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}