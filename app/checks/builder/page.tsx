'use client';

import * as React from 'react';
import { ListChecks, Plus, GripVertical, Trash2, Flag, Camera, StickyNote, FileText, History, Save, Send } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/page-header';
import { useSession } from '@/components/session-provider';
import { templateRepo } from '@/lib/repos';
import { fmtDateTime } from '@/lib/format';
import { can } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { ChecklistSection, ChecklistItem, ItemType } from '@/lib/types';

const TYPE_LABELS: Record<ItemType, string> = {
  pass_fail_na: 'Pass / Fail / N/A',
  yes_no: 'Yes / No',
  text: 'Text',
  number: 'Number',
  select: 'Select',
  photo: 'Photo',
  note: 'Note',
};

const TYPE_ICONS: Record<ItemType, React.ElementType> = {
  pass_fail_na: FileText, yes_no: FileText, text: FileText, number: FileText,
  select: FileText, photo: Camera, note: StickyNote,
};

export default function ChecklistBuilderPage() {
  const { effectiveUser } = useSession();
  if (!effectiveUser) return null;

  const templates = templateRepo.list();
  const activeTemplate = templates.find(t => t.active);
  const canEdit = can(effectiveUser, 'edit', 'checklist_builder');

  const [sections, setSections] = React.useState<ChecklistSection[]>(activeTemplate?.sections ?? []);
  const [draggedItem, setDraggedItem] = React.useState<{ sectionIdx: number; itemIdx: number } | null>(null);
  const [draggedSection, setDraggedSection] = React.useState<number | null>(null);

  const addSection = () => {
    setSections(prev => [...prev, { id: `s-${Date.now()}`, title: 'New section', items: [] }]);
  };

  const addItem = (sectionIdx: number) => {
    setSections(prev => prev.map((s, i) => i === sectionIdx
      ? { ...s, items: [...s.items, { id: `i-${Date.now()}`, label: 'New item', type: 'pass_fail_na', required: false }] }
      : s));
  };

  const removeItem = (sectionIdx: number, itemIdx: number) => {
    setSections(prev => prev.map((s, i) => i === sectionIdx
      ? { ...s, items: s.items.filter((_, j) => j !== itemIdx) }
      : s));
  };

  const removeSection = (sectionIdx: number) => {
    setSections(prev => prev.filter((_, i) => i !== sectionIdx));
  };

  const updateItem = (sectionIdx: number, itemIdx: number, patch: Partial<ChecklistItem>) => {
    setSections(prev => prev.map((s, i) => i === sectionIdx
      ? { ...s, items: s.items.map((it, j) => j === itemIdx ? { ...it, ...patch } : it) }
      : s));
  };

  const updateSectionTitle = (sectionIdx: number, title: string) => {
    setSections(prev => prev.map((s, i) => i === sectionIdx ? { ...s, title } : s));
  };

  const onDropItem = (targetSectionIdx: number, targetItemIdx: number) => {
    if (!draggedItem) return;
    setSections(prev => {
      const next = [...prev];
      const from = next[draggedItem.sectionIdx].items.splice(draggedItem.itemIdx, 1)[0];
      next[targetSectionIdx].items.splice(targetItemIdx, 0, from);
      return next;
    });
    setDraggedItem(null);
  };

  const onDropSection = (targetIdx: number) => {
    if (draggedSection === null || draggedSection === targetIdx) return;
    setSections(prev => {
      const next = [...prev];
      const [moved] = next.splice(draggedSection, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    setDraggedSection(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Checklist Builder"
        description="Build and publish daily walkaround check templates. Publishing creates a new immutable version."
        actions={canEdit ? (
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Save className="h-3.5 w-3.5" /> Save draft</Button>
            <Button size="sm" className="gap-1.5"><Send className="h-3.5 w-3.5" /> Publish new version</Button>
          </>
        ) : undefined}
      />

      <Tabs defaultValue="builder" className="mt-6">
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="versions"><History className="mr-1.5 h-3.5 w-3.5" /> Version history</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-4">
          {/* Scope */}
          <div className="mb-4 rounded-md border border-border bg-card p-3">
            <p className="text-xs font-medium text-muted-foreground">Assignment scope</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs">Company: {effectiveUser.companyId === 'c-dec' ? 'Dunstable Executive Cars' : 'DEC School Transport'}</span>
              {activeTemplate?.scope.vehicleTypes?.map(t => (
                <span key={t} className="rounded border border-border bg-muted px-2 py-0.5 text-xs">{t}</span>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {sections.map((section, si) => (
              <div
                key={section.id}
                className="rounded-md border border-border bg-card"
                onDragOver={e => { e.preventDefault(); }}
                onDrop={e => { e.preventDefault(); onDropSection(si); }}
              >
                <div className="flex items-center gap-2 border-b border-border p-3">
                  <span
                    className="cursor-grab"
                    draggable
                    onDragStart={() => setDraggedSection(si)}
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                  </span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={e => updateSectionTitle(si, e.target.value)}
                    disabled={!canEdit}
                    className="flex-1 bg-transparent text-sm font-semibold focus:outline-none"
                  />
                  {canEdit && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => addItem(si)} className="gap-1 text-xs">
                        <Plus className="h-3 w-3" /> Add item
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeSection(si)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="divide-y divide-border">
                  {section.items.map((item, ii) => {
                    const Icon = TYPE_ICONS[item.type];
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-3"
                        draggable={canEdit}
                        onDragStart={() => setDraggedItem({ sectionIdx: si, itemIdx: ii })}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); e.stopPropagation(); onDropItem(si, ii); }}
                      >
                        <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground/50" />
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={item.label}
                          onChange={e => updateItem(si, ii, { label: e.target.value })}
                          disabled={!canEdit}
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                        />
                        {item.criticalFailure && (
                          <span className="inline-flex items-center gap-1 rounded border border-bad/30 bg-bad-soft px-1.5 py-0.5 text-[10px] font-medium text-bad-fg">
                            <Flag className="h-2.5 w-2.5" /> Critical
                          </span>
                        )}
                        {item.mandatoryPhoto && (
                          <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            <Camera className="h-2.5 w-2.5" /> Photo
                          </span>
                        )}
                        {item.mandatoryNote && (
                          <span className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            <StickyNote className="h-2.5 w-2.5" /> Note
                          </span>
                        )}
                        {item.required && <span className="text-[10px] font-medium text-brand">Required</span>}
                        <select
                          value={item.type}
                          onChange={e => updateItem(si, ii, { type: e.target.value as ItemType })}
                          disabled={!canEdit}
                          className="h-7 rounded border border-input bg-background px-2 text-xs"
                        >
                          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        {canEdit && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(si, ii)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {section.items.length === 0 && (
                    <p className="p-3 text-xs text-muted-foreground">No items in this section.</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {canEdit && (
            <Button variant="outline" size="sm" onClick={addSection} className="mt-3 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add section
            </Button>
          )}

          <div className="mt-4 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            Publishing creates a new immutable version with author and date. Submitted checks keep their original template version — editing this template does not change past submissions.
          </div>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <div className="space-y-2">
            {templates.map(t => (
              <div key={t.versionId} className={cn('flex items-center justify-between rounded-md border border-border bg-card p-3', t.active && 'border-brand/40')}>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Published {fmtDateTime(t.publishedAt)} by {t.authorName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground tnum">{t.versionId}</span>
                  {t.active ? (
                    <span className="rounded border border-ok/30 bg-ok-soft px-2 py-0.5 text-xs font-medium text-ok-fg">Active</span>
                  ) : (
                    <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">Superseded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
