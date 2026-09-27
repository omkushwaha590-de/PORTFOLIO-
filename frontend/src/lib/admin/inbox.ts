/** Inbox types and their workflow statuses (mirror backend/src/models). */
export const INBOXES = {
  messages: {
    label: 'Messages',
    singular: 'Message',
    statuses: ['new', 'read', 'replied', 'archived'],
    description: 'Submissions from the contact form.',
  },
  quotes: {
    label: 'Inquiries',
    singular: 'Inquiry',
    statuses: ['new', 'reviewing', 'quoted', 'won', 'lost', 'archived'],
    description: 'Detailed engagement requests from the Get in touch page.',
  },
} as const;

export type InboxKind = keyof typeof INBOXES;

export const isInboxKind = (value: string): value is InboxKind => value in INBOXES;

export interface InboxItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  projectType: string;
  budget: string;
  timeline?: string;
  message?: string;
  description?: string;
  requirements?: string[];
  status: string;
  notes: string;
  createdAt: string;
}
