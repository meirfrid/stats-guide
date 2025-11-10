import React, { FormEvent, useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface ValidationErrors {
  email?: string;
  password?: string;
}

const SignInForm: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = (): ValidationErrors => {
    const validationErrors: ValidationErrors = {};

    if (!email.trim()) {
      validationErrors.email = t('emailRequired');
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      validationErrors.email = t('invalidEmail');
    }

    if (!password) {
      validationErrors.password = t('passwordRequired');
    }

    return validationErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    // Simulate authentication request
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: t('signInSuccess'),
        description: rememberMe
          ? t('signInRemembered')
          : t('signInWelcomeBack'),
      });
      setPassword('');
    }, 1200);
  };

  return (
    <div className="analysis-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{t('signInTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('signInSubtitle')}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <LogIn className="w-5 h-5" />
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-2">
          <Label htmlFor="sign-in-email" className="text-sm font-medium">
            {t('email')}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="sign-in-email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              className="pl-10"
              aria-describedby={errors.email ? 'sign-in-email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p id="sign-in-email-error" className="text-sm text-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sign-in-password" className="text-sm font-medium">
            {t('password')}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="sign-in-password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('passwordPlaceholder')}
              className="pl-10"
              aria-describedby={errors.password ? 'sign-in-password-error' : undefined}
            />
          </div>
          {errors.password && (
            <p id="sign-in-password-error" className="text-sm text-error">
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              id="sign-in-remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
            />
            <Label htmlFor="sign-in-remember-me" className="text-sm font-normal">
              {t('rememberMe')}
            </Label>
          </div>
          <Button type="button" variant="link" className="p-0 h-auto">
            {t('forgotPassword')}
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <LogIn className="w-4 h-4" />
          {isSubmitting ? t('signingIn') : t('signIn')}
        </Button>
      </form>
    </div>
  );
};

export default SignInForm;
