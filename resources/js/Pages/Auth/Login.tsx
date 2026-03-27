import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { InertiaFormField } from '@/Components/ui/InertiaFormField';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign In" />

            <h2 className={cn('text-xl font-semibold text-foreground mb-6')}>Sign In</h2>

            {status && (
                <div className={cn('mb-4 text-sm font-medium text-green-600')}>
                    {status}
                </div>
            )}

            <form onSubmit={submit} className={cn('space-y-4')}>
                <InertiaFormField
                    id="email"
                    label="Email"
                    type="email"
                    value={data.email}
                    autoComplete="username"
                    autoFocus
                    error={errors.email}
                    onChange={(v) => setData('email', v)}
                />

                <InertiaFormField
                    id="password"
                    label="Password"
                    type="password"
                    value={data.password}
                    autoComplete="current-password"
                    error={errors.password}
                    onChange={(v) => setData('password', v)}
                />

                <div className={cn('flex items-center')}>
                    <input
                        id="remember"
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className={cn('size-4 rounded border-input text-brand-orange accent-brand-orange')}
                    />
                    <Label htmlFor="remember" className={cn('ml-2 text-sm text-muted-foreground')}>
                        Remember me
                    </Label>
                </div>

                <div className={cn('flex items-center justify-between pt-2')}>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className={cn('text-sm text-muted-foreground hover:text-foreground')}
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <Button
                        type="submit"
                        disabled={processing}
                        className={cn('bg-brand-orange text-white hover:bg-brand-orange/90 ml-auto')}
                    >
                        Sign In
                    </Button>
                </div>

                <p className={cn('text-center text-sm text-muted-foreground')}>
                    Don't have an account?{' '}
                    <Link href={route('register')} className={cn('text-brand-orange hover:underline')}>
                        Sign Up
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
