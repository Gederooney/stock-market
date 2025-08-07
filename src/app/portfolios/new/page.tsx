import { Metadata } from 'next';
import { CreatePortfolioForm } from '@/components/portfolios/CreatePortfolioForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Create Portfolio - Stock Market Dashboard',
  description: 'Create a new investment portfolio',
};

export default function NewPortfolioPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Portfolio</CardTitle>
          <CardDescription>
            Set up a new portfolio to track your investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePortfolioForm />
        </CardContent>
      </Card>
    </div>
  );
}