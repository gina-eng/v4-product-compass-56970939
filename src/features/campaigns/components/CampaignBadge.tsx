import { cn } from "@/lib/utils";
import type { CaseCampaign } from "../storage";

export const CampaignBadge = ({
  campaign,
  className,
}: {
  campaign: CaseCampaign;
  className?: string;
}) => (
  <span
    title={campaign.description || campaign.name}
    className={cn(
      "inline-flex max-w-full items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-foreground",
      className,
    )}
  >
    <span
      className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
      // Cor da campanha é dado dinâmico do admin — não dá para expressar via classe Tailwind.
      style={campaign.color ? { backgroundColor: campaign.color } : undefined}
      aria-hidden
    />
    <span className="truncate">{campaign.name}</span>
  </span>
);
