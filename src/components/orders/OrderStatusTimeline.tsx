import { Check, Hourglass, Minus, XCircle } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import {
	buildOrderTimeline,
	getSaleStatusLabel,
	type TimelineStepState,
} from "@/lib/sale-status";
import { cn } from "@/lib/utils";
import type { DeliveryType, SaleStatus, StatusHistoryEntry } from "@/types";

export interface OrderStatusTimelineProps {
	status: SaleStatus;
	deliveryType: DeliveryType;
	history: StatusHistoryEntry[];
}

const STEP_STATE_TEXT: Record<TimelineStepState, string> = {
	done: "concluída",
	current: "etapa atual",
	upcoming: "próxima etapa",
	skipped: "não realizada",
};

const MARKER_CLASSES: Record<TimelineStepState, string> = {
	done: "border-emerald-500 bg-emerald-500 text-white",
	current: "border-primary bg-primary/15 text-primary ring-4 ring-primary/15",
	upcoming: "border-border bg-background text-muted-foreground",
	skipped: "border-dashed border-border bg-muted text-muted-foreground",
};

function StepMarker({
	state,
	index,
}: {
	state: TimelineStepState;
	index: number;
}) {
	return (
		<span
			className={cn(
				"relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
				MARKER_CLASSES[state],
			)}
			aria-hidden="true"
		>
			{state === "done" ? (
				<Check className="size-4" />
			) : state === "skipped" ? (
				<Minus className="size-4" />
			) : (
				index + 1
			)}
		</span>
	);
}

/** Linha do tempo das etapas do pedido (RF-55), com data e hora de cada mudança. */
export function OrderStatusTimeline({
	status,
	deliveryType,
	history,
}: OrderStatusTimelineProps) {
	const { steps, interruption } = buildOrderTimeline(
		status,
		deliveryType,
		history,
	);
	const isCanceled = interruption?.status === "CANCELADA";

	return (
		<section
			aria-labelledby="order-timeline-title"
			className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs"
		>
			<h2
				id="order-timeline-title"
				className="text-sm font-bold text-foreground"
			>
				Andamento do pedido
			</h2>

			<ol className="flex flex-col">
				{steps.map((step, index) => {
					const isLast = index === steps.length - 1;
					return (
						<li
							key={step.status}
							className="relative flex gap-3 pb-5 last:pb-0"
						>
							{!isLast && (
								<span
									className={cn(
										"absolute top-8 bottom-0 left-4 w-0.5 -translate-x-1/2",
										step.state === "done" ? "bg-emerald-500" : "bg-border",
									)}
									aria-hidden="true"
								/>
							)}
							<StepMarker state={step.state} index={index} />
							<div className="flex min-h-8 flex-col justify-center">
								<span
									className={cn(
										"text-sm font-semibold",
										step.state === "upcoming" || step.state === "skipped"
											? "text-muted-foreground"
											: "text-foreground",
									)}
									aria-current={step.state === "current" ? "step" : undefined}
								>
									{getSaleStatusLabel(step.status)}
									<span className="sr-only">
										{` (${STEP_STATE_TEXT[step.state]})`}
									</span>
								</span>
								{step.changedAt && (
									<time
										dateTime={step.changedAt}
										className="text-xs text-muted-foreground"
									>
										{formatDate(step.changedAt)}
									</time>
								)}
							</div>
						</li>
					);
				})}
			</ol>

			{interruption && (
				<div
					className={cn(
						"flex items-start gap-3 rounded-xl border p-3 text-sm",
						isCanceled
							? "border-destructive/30 bg-destructive/10 text-destructive"
							: "border-orange-500/40 bg-orange-500/10 text-orange-800 dark:text-orange-200",
					)}
				>
					{isCanceled ? (
						<XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
					) : (
						<Hourglass className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
					)}
					<div className="flex flex-col gap-0.5">
						<span className="font-semibold">
							{isCanceled
								? "Pedido cancelado"
								: "Aguardando o cliente responder ao ajuste"}
						</span>
						{interruption.changedAt && (
							<time dateTime={interruption.changedAt} className="text-xs">
								Desde {formatDate(interruption.changedAt)}
							</time>
						)}
					</div>
				</div>
			)}

			{history.length > 0 && (
				<details className="group text-xs">
					<summary className="flex h-11 cursor-pointer items-center font-medium text-muted-foreground hover:text-foreground">
						Ver todas as alterações ({history.length})
					</summary>
					<ul className="flex flex-col gap-2 border-l-2 border-border pl-3">
						{history.map((entry) => (
							<li
								key={`${entry.status}-${entry.changed_at}`}
								className="flex flex-col"
							>
								<span className="font-medium text-foreground">
									{getSaleStatusLabel(entry.status)}
								</span>
								<span className="text-muted-foreground">
									<time dateTime={entry.changed_at}>
										{formatDate(entry.changed_at)}
									</time>
									{entry.changed_by?.name && ` • por ${entry.changed_by.name}`}
								</span>
							</li>
						))}
					</ul>
				</details>
			)}
		</section>
	);
}
