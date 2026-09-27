'use client';

import { Button } from '@/components/ui/Button';
import type { SiteSettings } from '@/types/api';
import { Honeypot, SelectField, TextArea, TextField } from './fields';
import { FormError, SuccessPanel } from './FormStatus';
import { readForm, useSubmit } from './useSubmit';

type Options = Pick<SiteSettings, 'projectTypes' | 'budgetOptions' | 'timelineOptions'>;

/** Detailed engagement inquiry — submits to the quotation endpoint. Option lists come from admin settings. */
export function CollaborateForm({ options }: { options: Options }) {
  const { status, message, fieldErrors, submit, reset } = useSubmit('/quotes');

  if (status === 'success') {
    return (
      <SuccessPanel
        title="Inquiry received — thank you."
        body="I will review the details and reply with next steps, usually within a few working days."
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
      company: data.company ?? '',
      projectType: data.projectType ?? '',
      timeline: data.timeline ?? '',
      budget: data.budget ?? '',
      description: data.description,
      requirements: (data.requirements ?? '')
        .split('\n')
        .map((line) => line.replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 30),
      ...(data.website ? { website: data.website } : {}),
    });
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-6">
      <Honeypot />

      <fieldset className="space-y-5">
        <legend className="mb-5 font-mono text-xs tracking-wider text-muted uppercase">About you</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Name" name="name" autoComplete="name" maxLength={120} error={fieldErrors.name} />
          <TextField label="Email" name="email" type="email" autoComplete="email" maxLength={254} error={fieldErrors.email} />
        </div>
        <TextField
          label="Organisation"
          name="company"
          autoComplete="organization"
          maxLength={120}
          optional
          error={fieldErrors.company}
        />
      </fieldset>

      <fieldset className="space-y-5 border-t border-line pt-6">
        <legend className="mb-5 font-mono text-xs tracking-wider text-muted uppercase">The engagement</legend>
        <SelectField label="Type of engagement" name="projectType" options={options.projectTypes} error={fieldErrors.projectType} />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Expected timeline"
            name="timeline"
            options={options.timelineOptions}
            optional
            error={fieldErrors.timeline}
          />
          <SelectField
            label="Budget range"
            name="budget"
            options={options.budgetOptions}
            optional
            error={fieldErrors.budget}
          />
        </div>
        <TextArea
          label="Describe the challenge or opportunity"
          name="description"
          maxLength={10000}
          rows={6}
          error={fieldErrors.description}
        />
        <TextArea
          label="Specific needs or outcomes"
          name="requirements"
          rows={4}
          maxLength={9000}
          optional
          hint="One per line — e.g. “Reduce supplier PPM”, “Prepare for ISO 9001 audit”."
          error={fieldErrors.requirements}
        />
      </fieldset>

      <FormError message={message} />

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-subtle">Your details are used only to respond to this inquiry.</p>
        <Button type="submit" disabled={status === 'submitting'} className="sm:min-w-48">
          {status === 'submitting' ? (
            <>
              Sending…
            </>
          ) : (
            <>
              Send inquiry
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
