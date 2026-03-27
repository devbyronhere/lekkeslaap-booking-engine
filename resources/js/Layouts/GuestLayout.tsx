import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/Components/ui/card';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className={cn('flex min-h-screen flex-col items-center bg-muted pt-6 sm:justify-center sm:pt-0')}>
            <div className={cn('mb-6')}>
                <Link href="/" className={cn('text-2xl font-bold text-brand-gray')}>
                    LekkeSlaap
                </Link>
            </div>

            <Card className={cn('w-full max-w-md')}>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </div>
    );
}
