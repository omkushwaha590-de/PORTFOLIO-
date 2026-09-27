'use client';

import { Button } from '@/components/ui/Button';
import { Honeypot, SelectField, TextArea, TextField } from './fields';
import { FormError, SuccessPanel } from './FormStatus';
import { readForm, useSubmit } from './useSubmit';

export function ContactForm({ inquiryTypes }: { inquiryTypes: string[] }) {
  const { status, message, fieldErrors, submit, reset } = useSubmit('/contact');

  if (status === 'success') {
    return (
      <SuccessPanel
        title="Message received — thank you."
        body="I read every message personally and will get back to you as soon as I can."
        onReset={reset}
      />
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = readForm(event.currentTarget);
    await submit({
      name: data.name,
      email: data.email,
      phone: data.phone ?? '',
      company: data.company ?? '',
      projectType: data.projectType ?? '',
      message: data.message,
      ...(data.website ? { website: data.website } : {}),
    });
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" aria-describedby="contact-privacy">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Name" name="name" autoComplete="name" maxLength={120} error={fieldErrors.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" maxLength={254} error={fieldErrors.email} />
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={30}
          optional
          error={fieldErrors.phone}
        />
        <TextField
          label="Company"
          name="company"
          autoComplete="organization"
          maxLength={120}
          optional
          error={fieldErrors.company}
        />
      </div>
      {inquiryTypes.length > 0 && (
        <SelectField
          label="What is this about?"
          name="projectType"
          options={inquiryTypes}
          optional
          error={fieldErrors.projectType}
        />
      )}
      <TextArea label="Message" name="message" maxLength={5000} error={fieldErrors.message} />

      <FormError message={message} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="contact-privacy" className="text-xs text-subtle">
          Your details are used only to reply to you.
        </p>
        <Button type="submit" disabled={status === 'submitting'} className="sm:min-w-44">
          {status === 'submitting' ? (
            <>
              Sending…
            </>
          ) : (
            <>
              Send message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
