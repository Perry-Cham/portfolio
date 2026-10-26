'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type RepoDraft = {
  title: string;
  description: string;
  githubUrl: string;
  tags: string;
};

export type RepoFieldError = {
  /** Field the error belongs to, e.g. "description" */
  path: string;
  /** Message describing what is wrong */
  message: string;
};

export type RepoValidationIssue = {
  repoId: number;
  repoName: string;
  repoFullName?: string;
  /** Current values of the repository */
  values: RepoDraft;
  /** Offending fields */
  errors: RepoFieldError[];
  /** Number of errors found for this repository */
  count: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issues: RepoValidationIssue[];
  drafts: Record<number, RepoDraft>;
  onDraftChange: (repoId: number, draft: RepoDraft) => void;
  onResubmit: () => void;
  submitting?: boolean;
};

const FIELDS: {
  key: keyof RepoDraft;
  label: string;
  placeholder: string;
  multiline?: boolean;
}[] = [
  { key: 'title', label: 'Title', placeholder: 'Project title' },
  {
    key: 'description',
    label: 'Description',
    placeholder: 'One-line summary shown on cards',
    multiline: true,
  },
  {
    key: 'githubUrl',
    label: 'GitHub URL',
    placeholder: 'https://github.com/...',
  },
  {
    key: 'tags',
    label: 'Tags (comma-separated)',
    placeholder: 'React, Prisma, Next.js',
  },
];

const EMPTY_DRAFT: RepoDraft = {
  title: '',
  description: '',
  githubUrl: '',
  tags: '',
};

export function RepoValidationModal({
  open,
  onOpenChange,
  issues,
  drafts,
  onDraftChange,
  onResubmit,
  submitting = false,
}: Props) {
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [draft, setDraft] = useState<RepoDraft>(EMPTY_DRAFT);

  const totalErrors = issues.reduce((total, issue) => total + issue.count, 0);
  const active = issues.find((issue) => issue.repoId === activeId) ?? null;

  const fieldErrors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const error of active?.errors ?? []) {
      map[error.path] = error.message;
    }
    return map;
  }, [active]);

  // Reset the modal to the error list whenever it gets closed, so it always
  // opens on the list page again.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) {
      setView('list');
      setActiveId(null);
      setDraft(EMPTY_DRAFT);
    }
  }

  function openRepo(issue: RepoValidationIssue) {
    setActiveId(issue.repoId);
    setDraft(drafts[issue.repoId] ?? issue.values);
    setView('edit');
  }

  function handleSave() {
    if (activeId === null) return;
    onDraftChange(activeId, draft);
    setView('list');
    setActiveId(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {view === 'list' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {issues.length} reposit{issues.length === 1 ? 'y' : 'ies'} need
                attention
              </DialogTitle>
              <DialogDescription>
                {totalErrors} error{totalErrors === 1 ? '' : 's'} found. Click a
                repository to fix the highlighted fields, then resubmit.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              {issues.length === 0 ? (
                <p className="rounded-lg border border-border/60 p-4 text-sm text-muted-foreground">
                  Everything looks good now. Resubmit to import the selected
                  repositories.
                </p>
              ) : (
                issues.map((issue) => (
                  <button
                    key={issue.repoId}
                    type="button"
                    onClick={() => openRepo(issue)}
                    className="w-full rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-left transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-destructive">
                        {issue.repoName}
                      </span>
                      <span className="shrink-0 rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
                        {issue.count} error{issue.count === 1 ? '' : 's'}
                      </span>
                    </div>
                    {issue.repoFullName ? (
                      <div className="mt-0.5 truncate text-xs text-destructive/80">
                        {issue.repoFullName}
                      </div>
                    ) : null}
                    <ul className="mt-2 space-y-1 text-sm text-destructive">
                      {issue.errors.map((error, index) => (
                        <li key={`${error.path}-${index}`}>
                          <span className="font-medium">{error.path}</span>:{' '}
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={onResubmit} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : null}
                Resubmit
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Back to the error list"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                Fix {active?.repoName ?? 'repository'}
              </DialogTitle>
              <DialogDescription>
                Fill in the highlighted fields and save to return to the list.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {FIELDS.map((field) => {
                const error = fieldErrors[field.key];
                const invalid = Boolean(error);
                return (
                  <div key={field.key} className="space-y-2">
                    <Label
                      htmlFor={`repo-${activeId}-${field.key}`}
                      className={invalid ? 'text-destructive' : undefined}
                    >
                      {field.label}
                    </Label>
                    {field.multiline ? (
                      <Textarea
                        id={`repo-${activeId}-${field.key}`}
                        value={draft[field.key]}
                        onChange={(e) =>
                          setDraft({ ...draft, [field.key]: e.target.value })
                        }
                        placeholder={field.placeholder}
                        rows={3}
                        aria-invalid={invalid}
                        className={
                          invalid
                            ? 'border-destructive text-destructive focus-visible:ring-destructive'
                            : undefined
                        }
                      />
                    ) : (
                      <Input
                        id={`repo-${activeId}-${field.key}`}
                        value={draft[field.key]}
                        onChange={(e) =>
                          setDraft({ ...draft, [field.key]: e.target.value })
                        }
                        placeholder={field.placeholder}
                        aria-invalid={invalid}
                        className={
                          invalid
                            ? 'border-destructive text-destructive focus-visible:ring-destructive'
                            : undefined
                        }
                      />
                    )}
                    {invalid ? (
                      <p className="text-sm font-medium text-destructive">
                        {error}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setView('list')}>
                Back
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
