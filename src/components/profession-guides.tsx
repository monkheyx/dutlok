"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, MapPin, ShoppingCart, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROFESSION_GUIDES, type ProfessionGuide } from "@/data/profession-guides";

export function ProfessionGuides() {
  const [expanded, setExpanded] = useState(true);
  const crafting = PROFESSION_GUIDES.filter((p) => p.type === "crafting");
  const gathering = PROFESSION_GUIDES.filter((p) => p.type === "gathering");
  const secondary = PROFESSION_GUIDES.filter((p) => p.type === "secondary");

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold flex-1">Midnight Profession Leveling Guides</span>
        <span className="text-xs text-muted-foreground">{PROFESSION_GUIDES.length} professions</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
          <GuideSection title="Crafting" guides={crafting} />
          <GuideSection title="Gathering" guides={gathering} />
          <GuideSection title="Secondary" guides={secondary} />
        </div>
      )}
    </div>
  );
}

function GuideSection({ title, guides }: { title: string; guides: ProfessionGuide[] }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2">{title}</h3>
      <div className="space-y-2">
        {guides.map((guide) => (
          <GuideCard key={guide.name} guide={guide} />
        ))}
      </div>
    </div>
  );
}

function GuideCard({ guide }: { guide: ProfessionGuide }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-secondary/20 border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 transition-colors text-left"
      >
        <span className="text-xl flex-shrink-0">{guide.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">{guide.name}</h4>
          <p className="text-[10px] text-muted-foreground">
            Pairs with {guide.pairedWith} — Trainer: {guide.trainer} ({guide.trainerLocation})
          </p>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
          {/* Trainer */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
            <span>Trainer: <strong className="text-foreground">{guide.trainer}</strong> in {guide.trainerLocation}</span>
          </div>

          {/* Shopping List */}
          {guide.shoppingList && guide.shoppingList.length > 0 && (
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-400 mb-1 flex items-center gap-1.5">
                <ShoppingCart className="h-3 w-3" />
                Shopping List
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                {guide.shoppingList.map((item, i) => (
                  <span key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-orange-400/50 mt-0.5">•</span>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Leveling Steps */}
          <div>
            <h5 className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary mb-1.5">
              Leveling Path
            </h5>
            <div className="space-y-1.5">
              {guide.steps.map((step, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="flex-shrink-0 w-12 text-right font-mono text-primary font-bold">
                    {step.range}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-foreground font-medium">{step.recipe}</span>
                    {step.quantity && (
                      <span className="text-muted-foreground"> — {step.quantity}</span>
                    )}
                    {step.materials && (
                      <p className="text-muted-foreground/70 text-[11px]">{step.materials}</p>
                    )}
                    {step.note && (
                      <p className="text-muted-foreground/70 text-[11px] italic">{step.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="border-t border-border pt-2">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.12em] text-green-400 mb-1 flex items-center gap-1.5">
              <Lightbulb className="h-3 w-3" />
              Tips
            </h5>
            <ul className="space-y-0.5">
              {guide.tips.map((tip, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-muted-foreground">
                  <span className="text-green-400/50 mt-0.5">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
