'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, LogOut, Mail, Inbox, FolderKanban } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
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
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

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
                  className={`rounded-xl border bg-card p-4 ${
                    m.read ? 'border-border/60' : 'border-primary/40 bg-primary/5'
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
    </div>
  )
}
