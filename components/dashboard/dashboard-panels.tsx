import { Button } from "@/components/ui/button";
import { contentFieldTypes, type ContentFieldDefinition, type ContentFieldType } from "@/lib/content-schema";
import {
  type ActionState,
  type DeploymentHistoryRun,
  type FieldDraftValue,
  type NewFieldDraft,
  deploymentRunLabel,
  formatDeployDate,
} from "@/lib/dashboard-utils";
import { type DeploymentState, type PublishingActionState } from "@/lib/publishing-status-context";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export const baseInputClass =
  "h-11 border border-zinc-800 bg-black px-3 text-base text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#c3d9f3] focus:ring-1 focus:ring-[#c3d9f3]";

export const textareaClass =
  "resize-y border border-zinc-800 bg-black px-3 py-2 text-base text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-[#c3d9f3] focus:ring-1 focus:ring-[#c3d9f3]";

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ContentFieldDefinition;
  value: FieldDraftValue;
  onChange: (value: FieldDraftValue) => void;
}) {
  if (field.type === "boolean") {
    return (
      <label className="flex min-h-11 items-center gap-3 border border-zinc-800 px-3">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 border-zinc-700 bg-black accent-zinc-100"
        />
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">{field.label}</span>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="flex flex-col gap-2 md:col-span-2">
        <FieldLabel field={field} />
        <textarea
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className={textareaClass}
          placeholder={field.placeholder}
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="flex flex-col gap-2">
        <FieldLabel field={field} />
        <select value={String(value)} onChange={(event) => onChange(event.target.value)} className={baseInputClass}>
          <option value="">Select...</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-2">
      <FieldLabel field={field} />
      <input
        type={field.type === "date" ? "date" : "text"}
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
        className={baseInputClass}
        placeholder={field.placeholder}
      />
    </label>
  );
}

export function DashboardActionStatusPanel({ actionState }: { actionState: ActionState }) {
  if (!actionState.message) {
    return null;
  }

  const isError = actionState.kind === "error";
  const isSuccess = actionState.kind === "success";

  return (
    <section
      className={`border p-4 text-sm ${
        isError
          ? "border-red-900/60 bg-red-950/30 text-red-200"
          : isSuccess
            ? "border-emerald-900/60 bg-emerald-950/30 text-emerald-100"
            : "border-zinc-900 bg-black text-zinc-200"
      }`}
    >
      {actionState.message ? <p>{actionState.message}</p> : null}
      {actionState.href ? (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <Link href={actionState.href} target="_blank" className="inline-flex items-center gap-1 underline">
            View commit
            <ExternalLink className="size-3" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}

export function DashboardPublishingPanel({
  actionState,
  deploymentState,
}: {
  actionState: PublishingActionState;
  deploymentState: DeploymentState;
}) {
  return (
    <section className="border border-zinc-900 bg-black p-4 md:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="size-4 text-zinc-500" />
        <h2 className="font-mono text-lg font-normal text-zinc-50">Publishing</h2>
      </div>
      <div className="space-y-3 text-sm">
        {actionState.message ? (
          <StatusLine kind={actionState.kind} message={actionState.message} href={actionState.href} hrefLabel="View commit" />
        ) : null}
        {deploymentState.message ? (
          <StatusLine
            kind={deploymentState.kind}
            message={deploymentState.message}
            href={deploymentState.actionsUrl}
            hrefLabel="View deploy"
          />
        ) : null}
      </div>
    </section>
  );
}

export function DeployHistoryPanel({
  runs,
  state,
  onRefresh,
}: {
  runs: DeploymentHistoryRun[];
  state: ActionState;
  onRefresh: () => void;
}) {
  return (
    <section className="border border-zinc-900 bg-black p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-lg font-normal text-zinc-50">Deploy history</h2>
          <p className="mt-1 text-xs text-zinc-500">{state.message || "Ready"}</p>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onRefresh}>
          <RefreshCw />
          <span className="sr-only">Refresh deploy history</span>
        </Button>
      </div>

      {runs.length > 0 ? (
        <div className="divide-y divide-zinc-900 border border-zinc-900">
          {runs.map((run) => (
            <a
              key={run.id}
              href={run.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="grid gap-3 p-4 transition-colors hover:bg-zinc-950 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center"
            >
              <DeploymentRunIcon status={run.status} conclusion={run.conclusion} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-zinc-50">{run.name}</span>
                <span className="mt-1 block truncate font-mono text-xs text-zinc-500">
                  {deploymentRunLabel(run)} · {formatDeployDate(run.updatedAt || run.createdAt)}
                </span>
              </span>
              <ExternalLink className="size-4 text-zinc-500" />
            </a>
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-zinc-800 p-3 text-sm text-zinc-500">No deploy runs found.</p>
      )}
    </section>
  );
}

export function NewFieldEditor({
  field,
  onChange,
  onRemove,
}: {
  field: NewFieldDraft;
  onChange: (field: NewFieldDraft) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-3 border border-zinc-900 p-3 md:grid-cols-[minmax(0,1fr)_160px_auto]">
      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Field label</span>
        <input
          value={field.label}
          onChange={(event) => onChange({ ...field, label: event.target.value })}
          className={baseInputClass}
          placeholder="Rating"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Type</span>
        <select
          value={field.type}
          onChange={(event) => onChange({ ...field, type: event.target.value as ContentFieldType })}
          className={baseInputClass}
        >
          {contentFieldTypes.map((fieldType) => (
            <option key={fieldType} value={fieldType}>
              {fieldType}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end gap-2">
        <label className="flex h-11 items-center gap-2 border border-zinc-800 px-3">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(event) => onChange({ ...field, required: event.target.checked })}
            className="size-4 border-zinc-700 bg-black accent-zinc-100"
          />
          <span className="text-sm text-zinc-300">Required</span>
        </label>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 />
          <span className="sr-only">Remove field</span>
        </Button>
      </div>
      <label className="flex flex-col gap-2 md:col-span-2">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Placeholder</span>
        <input
          value={field.placeholder}
          onChange={(event) => onChange({ ...field, placeholder: event.target.value })}
          className={baseInputClass}
          placeholder="Optional"
        />
      </label>
      {field.type === "select" ? (
        <label className="flex flex-col gap-2 md:col-span-3">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">Options</span>
          <input
            value={field.optionsInput}
            onChange={(event) => onChange({ ...field, optionsInput: event.target.value })}
            className={baseInputClass}
            placeholder="Draft, Published, Archived"
          />
        </label>
      ) : null}
    </div>
  );
}

function FieldLabel({ field }: { field: ContentFieldDefinition }) {
  return (
    <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-400">
      {field.label}
      {field.required ? <span className="text-red-400"> *</span> : null}
    </span>
  );
}

function StatusLine({
  kind,
  message,
  href,
  hrefLabel,
}: {
  kind: ActionState["kind"] | DeploymentState["kind"];
  message: string;
  href?: string;
  hrefLabel: string;
}) {
  return (
    <div className="border border-zinc-900 p-3">
      <div className="flex items-start gap-2">
        <StatusIcon kind={kind} />
        <p className="min-w-0 flex-1 leading-6 text-zinc-200">{message}</p>
      </div>
      {href ? (
        <Link href={href} target="_blank" className="mt-2 inline-flex items-center gap-1 text-xs text-[#c3d9f3] underline">
          {hrefLabel}
          <ExternalLink className="size-3" />
        </Link>
      ) : null}
    </div>
  );
}

function StatusIcon({ kind }: { kind: ActionState["kind"] | DeploymentState["kind"] }) {
  if (kind === "success") {
    return <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-400" />;
  }

  if (kind === "error") {
    return <AlertCircle className="mt-1 size-4 shrink-0 text-red-400" />;
  }

  return <Clock3 className="mt-1 size-4 shrink-0 text-zinc-500" />;
}

function DeploymentRunIcon({ status, conclusion }: { status: string; conclusion: string | null }) {
  if (status === "completed" && conclusion === "success") {
    return <CheckCircle2 className="size-4 text-emerald-400" />;
  }

  if (status === "completed" && conclusion !== "success") {
    return <AlertCircle className="size-4 text-red-400" />;
  }

  return <Clock3 className="size-4 text-zinc-500" />;
}
