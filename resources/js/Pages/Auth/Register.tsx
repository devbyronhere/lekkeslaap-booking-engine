import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { InertiaFormField } from '@/Components/ui/InertiaFormField';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign Up" />

            <h2 className={cn('text-xl font-semibold text-foreground mb-6')}>Sign Up</h2>

            <form onSubmit={submit} className={cn('space-y-4')}>
                <InertiaFormField
                    id="name"
                    label="Name"
                    value={data.name}
                    autoComplete="name"
                    autoFocus
                    required
                    error={errors.name}
                    onChange={(v) => setData('name', v)}
                />

                <InertiaFormField
                    id="email"
                    label="Email"
                    type="email"
                    value={data.email}
                    autoComplete="username"
                    required
                    error={errors.email}
                    onChange={(v) => setData('email', v)}
                />

                <InertiaFormField
                    id="password"
                    label="Password"
                    type="password"
                    value={data.password}
                    autoComplete="new-password"
                    required
                    error={errors.password}
                    onChange={(v) => setData('password', v)}
                />

                <InertiaFormField
                    id="password_confirmation"
                    label="Confirm Password"
                    type="password"
                    value={data.password_confirmation}
                    autoComplete="new-password"
                    required
                    error={errors.password_confirmation}
                    onChange={(v) => setData('password_confirmation', v)}
                />

                <div className={cn('flex items-center justify-end pt-2')}>
                    <Button
                        type="submit"
                        disabled={processing}
                        className={cn('bg-brand-orange text-white hover:bg-brand-orange/90')}
                    >
                        Sign Up
                    </Button>
                </div>

                <p className={cn('text-center text-sm text-muted-foreground')}>
                    Already have an account?{' '}
                    <Link href={route('login')} className={cn('text-brand-orange hover:underline')}>
                        Sign In
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
