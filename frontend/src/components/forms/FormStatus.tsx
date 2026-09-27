import { Button } from '@/components/ui/Button';

export function SuccessPanel({ title, body, onReset }: { title: string; body: string; onReset: () => void }) {
  return (
    <div role="status" className="border-t-2 border-accent bg-surface p-8">
      <h3 className="text-2xl font-semibold tracking-[-0.02em]">{title}</h3>
      <p className="mt-2 max-w-md text-muted">{body}</p>
      <Button variant="secondary" className="mt-6" onClick={onReset}>
        Send another message
      </Button>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="border-l-2 border-red-400 bg-red-400/10 px-4 py-3 text-sm text-red-200">
      {message}
    </p>
  );
}
