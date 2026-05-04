import {
  DashboardActionStatusPanel,
  DashboardPublishingPanel,
  DeployHistoryPanel,
  FieldInput,
  NewFieldEditor,
  baseInputClass,
  textareaClass,
} from "@/components/dashboard/dashboard-panels";
import type { MdxEditorProps } from "@/components/dashboard/mdx-editor";
import { Button } from "@/components/ui/button";
import type { CollectionDefinition, ContentFieldDefinition } from "@/lib/content-schema";
import {
  type ActionState,
  type CollectionEntriesCache,
  type DeploymentHistoryRun,
  type EntryDraft,
  type EntrySummary,
  type FieldDraftValue,
  type NewFieldDraft,
  type SelectedImage,
  type TypeDraft,
  dashboardRouteHref,
  defaultFieldValue,
} from "@/lib/dashboard-utils";
import { type DeploymentState, type PublishingActionState } from "@/lib/publishing-status-context";
import { FileText, ImagePlus, ListPlus, Pencil, Plus, RefreshCw, Send, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const MdxEditor = dynamic<MdxEditorProps>(
  () => import("@/components/dashboard/mdx-editor").then((module) => module.MdxEditor),
  {
    ssr: false,
    loading: () => (
      <section className="border border-zinc-900 bg-black p-4 md:p-5">
        <h2 className="font-mono text-lg font-normal text-zinc-50">Body</h2>
        <p className="mt-2 text-sm text-zinc-500">Loading Markdown editor...</p>
      </section>
    ),
  },
);

export function DashboardOverviewView({
  collections,
  collectionsState,
  entriesByCollection,
  publishingActionState,
  deploymentState,
  deployHistory,
  deployHistoryState,
  onRefreshCollections,
  onRefreshDeployHistory,
  sessionPanel,
  repositoryPanel,
}: {
  collections: CollectionDefinition[];
  collectionsState: ActionState;
  entriesByCollection: Record<string, CollectionEntriesCache>;
  publishingActionState: PublishingActionState;
  deploymentState: DeploymentState;
  deployHistory: DeploymentHistoryRun[];
  deployHistoryState: ActionState;
  onRefreshCollections: () => void;
  onRefreshDeployHistory: () => void;
  sessionPanel: ReactNode;
  repositoryPanel: ReactNode;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        {publishingActionState.message || deploymentState.message ? (
          <DashboardPublishingPanel actionState={publishingActionState} deploymentState={deploymentState} />
        ) : null}

        <section className="border border-zinc-900 bg-black p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-mono text-lg font-normal text-zinc-50">Content</h2>
              <p className="mt-1 text-sm text-zinc-500">{collectionsState.message || "Ready"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={onRefreshCollections}>
                <RefreshCw />
                Refresh
              </Button>
              <Button asChild>
                <a href={dashboardRouteHref({ view: "new-type" })}>
                  <ListPlus />
                  New type
                </a>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => {
              const cache = entriesByCollection[collection.id];
              const countLabel = cache
                ? `${cache.entries.length} ${cache.entries.length === 1 ? collection.label.toLowerCase() : collection.pluralLabel.toLowerCase()}`
                : "Entries not loaded";

              return (
                <a
                  key={collection.id}
                  href={dashboardRouteHref({ view: "collection", collectionId: collection.id })}
                  className="group flex min-h-36 flex-col justify-between border border-zinc-900 bg-black p-4 transition-colors hover:border-zinc-700"
                >
                  <span>
                    <span className="flex items-start justify-between gap-3">
                      <span className="font-mono text-lg text-zinc-50">{collection.pluralLabel}</span>
                      <FileText className="mt-1 size-4 shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-300" />
                    </span>
                    <span className="mt-2 line-clamp-2 block text-sm leading-6 text-zinc-500">
                      {collection.description || `Manage ${collection.pluralLabel.toLowerCase()}.`}
                    </span>
                  </span>
                  <span className="mt-4 flex items-center justify-between gap-3">
                    <span className="font-mono text-xs text-zinc-500">/{collection.route}</span>
                    <span className="text-xs text-zinc-400">{cache?.state.message || countLabel}</span>
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        <DeployHistoryPanel runs={deployHistory} state={deployHistoryState} onRefresh={onRefreshDeployHistory} />
      </div>

      <aside className="space-y-6">
        {sessionPanel}
        {repositoryPanel}
      </aside>
    </section>
  );
}

export function DashboardCollectionIndexView({
  selectedCollection,
  entries,
  entriesState,
  onRefreshEntries,
  onStartNewEntry,
  collectionsPanel,
  sessionPanel,
}: {
  selectedCollection: CollectionDefinition;
  entries: EntrySummary[];
  entriesState: ActionState;
  onRefreshEntries: () => void;
  onStartNewEntry: () => void;
  collectionsPanel: ReactNode;
  sessionPanel: ReactNode;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="border border-zinc-900 bg-black p-4 md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">Collection</p>
              <h2 className="mt-2 font-mono text-2xl font-normal text-zinc-50">{selectedCollection.pluralLabel}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                {selectedCollection.description || `Manage ${selectedCollection.pluralLabel.toLowerCase()}.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={onRefreshEntries}>
                <RefreshCw />
                Refresh
              </Button>
              <Button type="button" onClick={onStartNewEntry}>
                <Plus />
                New {selectedCollection.label.toLowerCase()}
              </Button>
            </div>
          </div>
          <dl className="mt-5 grid gap-3 border-t border-zinc-900 pt-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Entries</dt>
              <dd className="mt-1 text-zinc-100">{entries.length}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Public route</dt>
              <dd className="mt-1 font-mono text-zinc-100">/{selectedCollection.route}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Status</dt>
              <dd className="mt-1 text-zinc-100">{entriesState.message || "Ready"}</dd>
            </div>
          </dl>
        </section>

        <section className="border border-zinc-900 bg-black p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-mono text-lg font-normal text-zinc-50">Entries</h2>
            <p className="text-xs text-zinc-500">{entriesState.message || "Ready"}</p>
          </div>

          {entries.length > 0 ? (
            <div className="divide-y divide-zinc-900 border border-zinc-900">
              {entries.map((entry) => (
                <a
                  key={entry.slug}
                  href={dashboardRouteHref({
                    view: "edit-entry",
                    collectionId: selectedCollection.id,
                    entrySlug: entry.slug,
                  })}
                  className="grid gap-3 p-4 transition-colors hover:bg-zinc-950 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-zinc-50">{entry.title}</span>
                    <span className="mt-1 line-clamp-2 block text-sm leading-6 text-zinc-500">
                      {entry.description}
                    </span>
                    <span className="mt-2 block truncate font-mono text-xs text-zinc-600">{entry.slug}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">
                    <Pencil className="size-4" />
                    Edit
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-zinc-800 p-5">
              <p className="text-sm text-zinc-500">No entries found.</p>
              <Button type="button" className="mt-4" onClick={onStartNewEntry}>
                <Plus />
                New {selectedCollection.label.toLowerCase()}
              </Button>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        {collectionsPanel}
        {sessionPanel}
      </aside>
    </section>
  );
}

export function DashboardEntryEditorView({
  selectedCollection,
  draft,
  images,
  previewImageBaseUrl,
  mdx,
  isEditing,
  isLoadingEditingEntry,
  actionState,
  publishingActionState,
  deploymentState,
  onPublishEntry,
  onUpdateDraft,
  onUpdateFieldValue,
  onStageImageFiles,
  onInsertImageMarkdown,
  onRemoveImage,
  outputPanel,
  collectionsPanel,
  sessionPanel,
}: {
  selectedCollection: CollectionDefinition;
  draft: EntryDraft;
  images: SelectedImage[];
  previewImageBaseUrl: string;
  mdx: string;
  isEditing: boolean;
  isLoadingEditingEntry: boolean;
  actionState: ActionState;
  publishingActionState: PublishingActionState;
  deploymentState: DeploymentState;
  onPublishEntry: () => void;
  onUpdateDraft: <Key extends keyof Omit<EntryDraft, "fieldValues">>(key: Key, value: EntryDraft[Key]) => void;
  onUpdateFieldValue: (field: ContentFieldDefinition, value: FieldDraftValue) => void;
  onStageImageFiles: (files: File[]) => SelectedImage[];
  onInsertImageMarkdown: (image: SelectedImage) => void;
  onRemoveImage: (id: string) => void;
  outputPanel: ReactNode;
  collectionsPanel: ReactNode;
  sessionPanel: ReactNode;
}) {
  if (isLoadingEditingEntry) {
    return (
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="border border-zinc-900 bg-black p-4 md:p-5">
            <h2 className="font-mono text-lg font-normal text-zinc-50">Loading entry</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {actionState.message || `Loading ${selectedCollection.label.toLowerCase()} from GitHub...`}
            </p>
          </section>
          <DashboardActionStatusPanel actionState={actionState} />
        </div>
        <aside className="space-y-6">
          {collectionsPanel}
          {sessionPanel}
        </aside>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <section className="border border-zinc-900 bg-black p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Title</span>
              <input
                value={draft.title}
                onChange={(event) => onUpdateDraft("title", event.target.value)}
                className={baseInputClass}
                placeholder={`${selectedCollection.label} title`}
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Description</span>
              <textarea
                value={draft.description}
                onChange={(event) => onUpdateDraft("description", event.target.value)}
                rows={3}
                className={textareaClass}
                placeholder="Short summary for listings and metadata."
              />
            </label>

            {selectedCollection.fields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={draft.fieldValues[field.name] ?? defaultFieldValue(field)}
                onChange={(value) => onUpdateFieldValue(field, value)}
              />
            ))}
          </div>
        </section>

        <MdxEditor
          label={selectedCollection.bodyLabel ?? "Body"}
          value={draft.body}
          onChange={(value) => onUpdateDraft("body", value)}
          placeholder={selectedCollection.bodyPlaceholder ?? "Write in Markdown."}
          images={images}
          existingImageBaseUrl={previewImageBaseUrl}
          onImagesAdded={onStageImageFiles}
        />

        {images.length > 0 ? (
          <section className="border border-zinc-900 bg-black p-4 md:p-5">
            <h2 className="mb-4 font-mono text-lg font-normal text-zinc-50">Images</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {images.map((image) => (
                <div key={image.id} className="overflow-hidden border border-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.previewUrl} alt="" className="aspect-video w-full object-cover" />
                  <div className="space-y-3 p-3">
                    <p className="truncate font-mono text-xs text-zinc-500">{image.safeName}</p>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => onInsertImageMarkdown(image)}>
                        <ImagePlus />
                        Insert
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => onRemoveImage(image.id)}>
                        <Trash2 />
                        <span className="sr-only">Remove image</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <aside className="space-y-6">
        <section className="border border-zinc-900 bg-black p-4">
          <h2 className="mb-4 font-mono text-lg font-normal text-zinc-50">Entry</h2>
          <div className="grid gap-2">
            <Button asChild variant="outline" className="w-full">
              <a href={dashboardRouteHref({ view: "collection", collectionId: selectedCollection.id })}>
                {selectedCollection.pluralLabel}
              </a>
            </Button>
            <Button type="button" className="w-full" onClick={onPublishEntry} disabled={actionState.kind === "working" || isLoadingEditingEntry}>
              <Send />
              {isEditing ? "Save" : "Publish"}
            </Button>
          </div>
        </section>

        {publishingActionState.message || deploymentState.message ? null : (
          <DashboardActionStatusPanel actionState={actionState} />
        )}

        {outputPanel}

        <section className="border border-zinc-900 bg-black p-4">
          <h2 className="mb-4 font-mono text-lg font-normal text-zinc-50">MDX</h2>
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap border border-zinc-900 bg-zinc-950 p-3 font-mono text-xs leading-5 text-zinc-200">
            {mdx}
          </pre>
        </section>
      </aside>
    </section>
  );
}

export function DashboardNewTypeView({
  typeDraft,
  actionState,
  publishingActionState,
  deploymentState,
  onChangeTypeDraft,
  onAddTypeField,
  onUpdateTypeField,
  onRemoveTypeField,
  onCreateContentType,
  collectionsPanel,
  sessionPanel,
}: {
  typeDraft: TypeDraft;
  actionState: ActionState;
  publishingActionState: PublishingActionState;
  deploymentState: DeploymentState;
  onChangeTypeDraft: (typeDraft: TypeDraft) => void;
  onAddTypeField: () => void;
  onUpdateTypeField: (id: string, nextField: NewFieldDraft) => void;
  onRemoveTypeField: (id: string) => void;
  onCreateContentType: () => void;
  collectionsPanel: ReactNode;
  sessionPanel: ReactNode;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="border border-zinc-900 bg-black p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-mono text-lg font-normal text-zinc-50">New content type</h2>
            <Button type="button" variant="outline" size="sm" onClick={onAddTypeField}>
              <Plus />
              Field
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Singular label</span>
              <input
                value={typeDraft.label}
                onChange={(event) => onChangeTypeDraft({ ...typeDraft, label: event.target.value })}
                className={baseInputClass}
                placeholder="Reseña"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Plural label</span>
              <input
                value={typeDraft.pluralLabel}
                onChange={(event) => onChangeTypeDraft({ ...typeDraft, pluralLabel: event.target.value })}
                className={baseInputClass}
                placeholder="Reseñas"
              />
            </label>

            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Description</span>
              <textarea
                value={typeDraft.description}
                onChange={(event) => onChangeTypeDraft({ ...typeDraft, description: event.target.value })}
                rows={2}
                className={textareaClass}
                placeholder="Short summary for the collection page."
              />
            </label>
          </div>

          {typeDraft.fields.length > 0 ? (
            <div className="mt-5 space-y-3">
              {typeDraft.fields.map((field) => (
                <NewFieldEditor
                  key={field.id}
                  field={field}
                  onChange={(nextField) => onUpdateTypeField(field.id, nextField)}
                  onRemove={() => onRemoveTypeField(field.id)}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" onClick={onAddTypeField}>
              <ListPlus />
              Add field
            </Button>
            <Button type="button" onClick={onCreateContentType} disabled={actionState.kind === "working"}>
              <FileText />
              Create type
            </Button>
          </div>
        </section>

        {publishingActionState.message || deploymentState.message ? null : (
          <DashboardActionStatusPanel actionState={actionState} />
        )}
      </div>

      <aside className="space-y-6">
        {collectionsPanel}
        {sessionPanel}
      </aside>
    </section>
  );
}
