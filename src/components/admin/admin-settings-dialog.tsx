'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { SelectGroup } from '@radix-ui/react-select';
import { AppSettings, settingsSchema } from '@/zodSchemas/settingsSchema';

type Token = {
  type: string;
  token: string;
  userId: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFetchRepos: (token: string) => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
};

export function SettingsDialog({
  open,
  onOpenChange,
  onFetchRepos,
  settings,
  onSettingsChange,
}: Props) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [showNewToken, setShowNewToken] = useState(false);
  const [newTokenType, setNewTokenType] = useState('github');
  const [newTokenValue, setNewTokenValue] = useState('');
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<{ tokens: Token[] }>('/api/tokens');
      setTokens(data.tokens ?? []);
    } catch {
      toast.error('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchTokens();
    }
  }, [open, fetchTokens]);

  async function handleNewTokenSubmit() {
    if (!newTokenValue.trim()) {
      toast.error('Token is required');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('/api/tokens', {
        type: newTokenType,
        token: newTokenValue.trim(),
      });
      toast.success('Token saved');
      setShowNewToken(false);
      setNewTokenValue('');
      await fetchTokens();
    } catch {
      toast.error('Failed to save token');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(type: string) {
    if (!editValue.trim()) {
      toast.error('Token is required');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post('/api/tokens', {
        type,
        token: editValue.trim(),
      });
      toast.success('Token updated');
      setEditingType(null);
      setEditValue('');
      await fetchTokens();
    } catch {
      toast.error('Failed to update token');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(type: string) {
    if (!window.confirm(`Delete the "${type}" token?`)) {
      return;
    }
    try {
      await axios.delete(`/api/tokens?type=${encodeURIComponent(type)}`);
      toast.success('Token deleted');
      await fetchTokens();
    } catch {
      toast.error('Failed to delete token');
    }
  }

  function handleFetchRepos() {
    const githubToken = tokens.find((t) => t.type === 'github')?.token;
    if (!githubToken) {
      toast.error('No GitHub token configured. Add one first.');
      return;
    }
    onFetchRepos(githubToken);
  }

  async function handleStrictDescriptionsChange(checked: boolean) {
    const parsed = settingsSchema.safeParse({
      ...settings,
      strictDescriptions: checked,
    });
    if (!parsed.success) {
      toast.error('Invalid settings');
      return;
    }

    setSavingSettings(true);
    try {
      await axios.put('/api/settings', parsed.data);
      onSettingsChange(parsed.data);
      toast.success('Settings updated');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage access tokens and import GitHub repositories.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Token section */}
          <div className="space-y-2">
            <Label className="font-semibold">Token</Label>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : tokens.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tokens configured.
              </p>
            ) : (
              <div className="space-y-2">
                {tokens.map((t) => (
                  <div
                    key={t.type}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground truncate">
                        {t.type}
                      </span>
                      {editingType === t.type ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-48"
                        />
                      ) : (
                        <span className="text-xs break-all">{t.token}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {editingType === t.type ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSubmit(t.type)}
                            disabled={submitting}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingType(null);
                              setEditValue('');
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditValue(t.token);
                              setEditingType(t.type);
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(t.type)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewToken(true)}
              >
                <Plus className="mr-1 h-3 w-3" /> New token
              </Button>

              {showNewToken && (
                <div className="mt-3 space-y-2">
                  <SelectGroup>
                    <SelectLabel>Type</SelectLabel>
                    <Select
                      value={newTokenType}
                      onValueChange={setNewTokenType}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="github">GitHub</SelectItem>
                      </SelectContent>
                    </Select>
                  </SelectGroup>

                  <div className="space-y-2">
                    <Label>Token</Label>
                    <Input
                      value={newTokenValue}
                      onChange={(e) => setNewTokenValue(e.target.value)}
                      placeholder="ghp_..."
                    />
                  </div>

                  <Button
                    onClick={handleNewTokenSubmit}
                    disabled={submitting || !newTokenValue.trim()}
                  >
                    {submitting ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : null}
                    Add token
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Validation settings */}
          <div className="space-y-2 pt-2 border-t">
            <Label className="font-semibold">Validation</Label>

            <div className="flex items-start justify-between gap-4 rounded-md border border-border/60 p-3">
              <div className="space-y-1">
                <Label
                  htmlFor="strict-descriptions"
                  className="text-sm font-medium"
                >
                  Strict descriptions
                </Label>
                <p className="text-xs text-muted-foreground">
                  On: descriptions are optional (loose schema). Off:
                  descriptions are required and repositories missing them are
                  flagged in the import review.
                </p>
              </div>
              <Switch
                id="strict-descriptions"
                checked={settings.strictDescriptions}
                onCheckedChange={handleStrictDescriptionsChange}
                disabled={savingSettings}
              />
            </div>
          </div>

          {/* Fetch repos */}
          <div className="pt-2 border-t">
            <Button
              onClick={handleFetchRepos}
              className="w-full"
              disabled={!tokens.some((t) => t.type === 'github')}
            >
              <ArrowRight className="mr-2 h-4 w-4" /> Fetch repos
            </Button>
            <p className="text-xs text-muted-foreground">
              Requires a GitHub token. Calls the GitHub API via axios with the
              token as a bearer token.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
