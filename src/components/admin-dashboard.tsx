'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Plus, Pencil, Trash2, LogOut, Mail, Inbox, FolderKanban, Settings, RefreshCw, Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { SettingsDialog } from '@/components/admin-settings-dialog'
import {
  RepoDraft,
  RepoValidationIssue,
  RepoValidationModal,
} from '@/components/repo-validation-modal'
import { getProjectSchema } from '@/zodSchemas/projectSchema'
import { formatIssues } from '@/zodSchemas/formatIssues'
import {
  AppSettings,
  DEFAULT_SETTINGS,
  parseSettings,
} from '@/zodSchemas/settingsSchema'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type Project = {
  id: string
  title: string
  description: string
  longDescription: string | null
  imageUrl: string | null
  liveUrl: string | null
  githubUrl: string | null
  tags: string
  featured: boolean
  createdAt: string
  updatedAt: string
}

type Message = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

type FormState = {
  title: string
  description: string
  longDescription: string
  imageUrl: string
  liveUrl: string
  githubUrl: string
  tags: string
  featured: boolean
}

const emptyForm: FormState = {
  title: '',
  description: '',
  longDescription: '',
  imageUrl: '',
  liveUrl: '',
  githubUrl: '',
  tags: '',
  featured: false,
}

type Repo = {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  created_at: string
  updated_at: string
}

function toDraft(repo: Repo): RepoDraft {
  return {
    title: repo.name,
    description: repo.description ?? '',
    githubUrl: repo.html_url ?? '',
    tags: '',
  }
}

function toPayload(draft: RepoDraft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    githubUrl: draft.githubUrl.trim() ? draft.githubUrl.trim() : null,
    tags: draft.tags.trim(),
  }
}

/**
 * Maps the validation errors returned by the api back to the repositories
 * that were sent so they can be shown in the review modal.
 */
function toServerIssues(
  body: { issues?: { index: number; errors: { path: string; message: string }[]; count: number }[] },
  candidates: { repo: Repo; values: ReturnType<typeof toPayload> }[],
): RepoValidationIssue[] {
  if (!Array.isArray(body?.issues)) return []

  return body.issues.map((issue) => {
    const candidate = candidates[issue.index]
    const repo = candidate?.repo
    return {
      repoId: repo?.id ?? issue.index,
      repoName: repo?.name ?? `Repository ${issue.index + 1}`,
      repoFullName: repo?.full_name,
      values: {
        title: candidate?.values.title ?? repo?.name ?? '',
        description: candidate?.values.description ?? repo?.description ?? '',
        githubUrl: candidate?.values.githubUrl ?? repo?.html_url ?? '',
        tags: candidate?.values.tags ?? '',
      },
      errors: (issue.errors ?? []).map((error) => ({
        path: error.path,
        message: error.message,
      })),
      count: issue.count ?? issue.errors?.length ?? 0,
    }
  })
}

function toForm(p: Project): FormState {
  return {
    title: p.title,
    description: p.description,
    longDescription: p.longDescription ?? '',
    imageUrl: p.imageUrl ?? '',
    liveUrl: p.liveUrl ?? '',
    githubUrl: p.githubUrl ?? '',
    tags: p.tags ?? '',
    featured: p.featured,
  }
}

export function AdminDashboard({ userName }: { userName: string }) {
  const router = useRouter()
  const qc = useQueryClient()

  const projectsQ = useQuery({
    queryKey: ['admin', 'projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects')
      const j = await res.json()
      return j.projects as Project[]
    },
  })
  const messagesQ = useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: async () => {
      const res = await fetch('/api/messages')
      if (!res.ok) throw new Error('Unauthorized')
      const j = await res.json()
      return j.messages as Message[]
    },
    retry: false,
  })

  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [repos, setRepos] = useState<Repo[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [adding, setAdding] = useState(false)
  const [fetching, setFetching] = useState(false)

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [drafts, setDrafts] = useState<Record<number, RepoDraft>>({})
  const [validationOpen, setValidationOpen] = useState(false)
  const [validationIssues, setValidationIssues] = useState<RepoValidationIssue[]>([])

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      try {
        const res = await fetch('/api/settings')
        if (!res.ok) return
        const j = await res.json()
        if (cancelled) return
        setSettings(parseSettings(j?.settings))
      } catch {
        // keep the defaults when the settings cannot be loaded
      }
    }

    loadSettings()
    return () => {
      cancelled = true
    }
  }, [])

  /**
   * Validates the selected repositories against the shared project schema and
   * returns the offending ones together with the number of errors each of
   * them has.
   */
  const collectIssues = useCallback(
    (draftMap: Record<number, RepoDraft>, activeSettings: AppSettings = settings): RepoValidationIssue[] => {
      const schema = getProjectSchema(activeSettings.strictDescriptions)
      const issues: RepoValidationIssue[] = []

      for (const repo of repos) {
        if (!selected.has(repo.id)) continue

        const values = draftMap[repo.id] ?? toDraft(repo)
        const parsed = schema.safeParse(toPayload(values))
        if (parsed.success) continue

        const formatted = formatIssues(parsed.error)
        issues.push({
          repoId: repo.id,
          repoName: repo.name,
          repoFullName: repo.full_name,
          values,
          errors: formatted.errors,
          count: formatted.count,
        })
      }

      return issues
    },
    [repos, selected, settings],
  )

  function handleSettingsChange(next: AppSettings) {
    setSettings(next)
    setValidationIssues(collectIssues(drafts, next))
  }

  function handleDraftChange(repoId: number, draft: RepoDraft) {
    const nextDrafts = { ...drafts, [repoId]: draft }
    setDrafts(nextDrafts)
    setValidationIssues(collectIssues(nextDrafts))
  }

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(p: Project) {
    setEditId(p.id)
    setForm(toForm(p))
    setOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const url = editId ? `/api/projects/${editId}` : '/api/projects'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const j = await res.json()
      if (!res.ok) {
        toast.error(j?.error ?? 'Failed to save project')
        return
      }
      toast.success(editId ? 'Project updated' : 'Project created')
      setOpen(false)
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Failed to delete')
      return
    }
    toast.success('Project deleted')
    qc.invalidateQueries({ queryKey: ['admin', 'projects'] })
    qc.invalidateQueries({ queryKey: ['projects'] })
  }

  async function handleFetchRepos(token: string) {
    setFetching(true)
    try {
      const { data } = await axios.get<Repo[]>('https://api.github.com/user/repos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRepos(data ?? [])
      setSelected(new Set())
      setSettingsOpen(false)
      toast.success(`Found ${data?.length ?? 0} repositories`)
    } catch {
      toast.error('Failed to fetch repositories from GitHub')
    } finally {
      setFetching(false)
    }
  }

  function handleToggleSelect(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  function handleSelectAll() {
    if (selected.size === repos.length && repos.length > 0) {
      setSelected(new Set())
    } else {
      setSelected(new Set(repos.map((r) => r.id)))
    }
  }

  async function handleAddRepos() {
    if (selected.size === 0) return
    setAdding(true)
    try {
      const candidates = repos
        .filter((r) => selected.has(r.id))
        .map((r) => ({ repo: r, values: toPayload(drafts[r.id] ?? toDraft(r)) }))

      // Validate against the shared schema before hitting the api so the
      // offending repositories can be reviewed and fixed.
      const issues = collectIssues(drafts)
      if (issues.length > 0) {
        setValidationIssues(issues)
        setValidationOpen(true)
        toast.error(
          `${issues.length} reposit${issues.length === 1 ? 'y' : 'ies'} failed validation`,
        )
        return
      }

      const payload = candidates.map((c) => c.values)
      const res = await fetch('/api/projects/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await res.json()
      if (!res.ok) {
        const serverIssues = toServerIssues(j, candidates)
        if (serverIssues.length > 0) {
          setValidationIssues(serverIssues)
          setValidationOpen(true)
          toast.error('Some repositories failed validation')
          return
        }
        toast.error(j?.error ?? 'Failed to add repositories')
        return
      }
      toast.success(`Added ${j.count ?? payload.length} project(s)`)
      setRepos([])
      setSelected(new Set())
      setDrafts({})
      setValidationIssues([])
      setValidationOpen(false)
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    } catch {
      toast.error('Failed to add repositories')
    } finally {
      setAdding(false)
    }
  }

  async function handleSignOut() {
    await authClient.signOut()
    toast.success('Signed out')
    router.push('/')
    router.refresh()
  }

  async function toggleMessageRead(m: Message, read: boolean) {
    const res = await fetch('/api/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: m.id, read }),
    })
    if (!res.ok) {
      toast.error('Failed to update')
      return
    }
    qc.invalidateQueries({ queryKey: ['admin', 'messages'] })
  }

  async function deleteMessage(id: string) {
    const res = await fetch(`/api/messages?id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Failed to delete')
      return
    }
    toast.success('Message deleted')
    qc.invalidateQueries({ queryKey: ['admin', 'messages'] })
  }

  const projects = projectsQ.data ?? []
  const messages = messagesQ.data ?? []
  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Admin · {userName}</h1>
        </div>
        <Button variant="outline" onClick={() => setSettingsOpen(true)}>
          <Settings className='mr-1 h-4 w-4' /> Settings
        </Button>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-1 h-4 w-4" /> Sign out
        </Button>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="mb-6">
          <TabsTrigger value="projects">
            <FolderKanban className="mr-1.5 h-4 w-4" /> Projects
            <Badge variant="secondary" className="ml-2">{projects.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="messages">
            <Inbox className="mr-1.5 h-4 w-4" /> Messages
            <Badge variant="secondary" className="ml-2">{messages.length}</Badge>
            {unreadCount > 0 && (
              <Badge className="ml-1">{unreadCount} new</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Manage projects</h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}>
                  <Plus className="mr-1 h-4 w-4" /> New project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editId ? 'Edit project' : 'New project'}
                  </DialogTitle>
                  <DialogDescription>
                    {editId
                      ? 'Update the project details below.'
                      : 'Fill in the details for the new project.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Project title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Short description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="One-line summary shown on cards"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longDescription">Long description</Label>
                    <Textarea
                      id="longDescription"
                      value={form.longDescription}
                      onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                      placeholder="More detail for the project detail page"
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={form.imageUrl}
                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        placeholder="React, Prisma, Next.js"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="liveUrl">Live URL</Label>
                      <Input
                        id="liveUrl"
                        value={form.liveUrl}
                        onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="githubUrl">GitHub URL</Label>
                      <Input
                        id="githubUrl"
                        value={form.githubUrl}
                        onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="featured"
                      checked={form.featured}
                      onCheckedChange={(v) => setForm({ ...form, featured: !!v })}
                    />
                    <Label htmlFor="featured">Featured project</Label>
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {projectsQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
              No projects yet. Click “New project” to add your first.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Tags
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Created
                    </TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell className="hidden max-w-xs md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {p.tags
                            ?.split(',')
                            .map((t) => t.trim())
                            .filter(Boolean)
                            .slice(0, 3)
                            .map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs">
                                {t}
                              </Badge>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {p.featured ? (
                          <Badge>Yes</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete &ldquo;{p.title}&rdquo;?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. The project will
                                  be permanently removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(p.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages">
          {messagesQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : messagesQ.isError ? (
            <p className="text-sm text-destructive">
              Failed to load messages.
            </p>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
              <Mail className="mx-auto mb-2 h-6 w-6" />
              No messages yet.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl border bg-card p-4 ${m.read ? 'border-border/60' : 'border-primary/40 bg-primary/5'
                    }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">
                        {m.subject}
                        {!m.read && (
                          <Badge className="ml-2 text-[10px]">New</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        From{' '}
                        <span className="font-medium text-foreground">
                          {m.name}
                        </span>{' '}
                        &lt;{m.email}&gt; ·{' '}
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMessageRead(m, !m.read)}
                      >
                        Mark as {m.read ? 'unread' : 'read'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete message"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete message?</AlertDialogTitle>
                            <AlertDialogDescription>
                              From {m.name} — “{m.subject}”. This cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMessage(m.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* GitHub repo import list */}
      {repos.length > 0 && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Import repositories</h2>
            {fetching ? (
              <Button variant="outline" disabled>
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Fetching…
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setSettingsOpen(true)}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" /> Fetch more
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-border/60 p-2 max-h-80 overflow-y-auto">
            {repos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No repositories found.
              </p>
            ) : (
              <div className="space-y-1">
                {repos.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors"
                  >
                    <Checkbox
                      checked={selected.has(repo.id)}
                      onCheckedChange={(checked) =>
                        handleToggleSelect(repo.id, checked as boolean)
                      }
                      aria-label={`Select ${repo.name}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" title={repo.name}>
                        {repo.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate" title={repo.full_name}>
                        {repo.full_name}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(repo.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(repo.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={repos.length === 0}
            >
              {selected.size === repos.length && repos.length > 0
                ? 'Select none'
                : 'Select all'}
            </Button>
            <span className="text-xs text-muted-foreground">
              {selected.size} of {repos.length} selected
            </span>
            <Button
              onClick={handleAddRepos}
              disabled={adding || selected.size === 0}
              className={selected.size > 0 ? '' : 'opacity-50'}
            >
              {adding ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Adding…
                </>
              ) : (
                'Add selected'
              )}
            </Button>
          </div>
        </section>
      )}

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onFetchRepos={handleFetchRepos}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <RepoValidationModal
        open={validationOpen}
        onOpenChange={setValidationOpen}
        issues={validationIssues}
        drafts={drafts}
        onDraftChange={handleDraftChange}
        onResubmit={handleAddRepos}
        submitting={adding}
      />
    </div>
  )
}
