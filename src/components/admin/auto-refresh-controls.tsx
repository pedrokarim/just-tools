"use client";

import { useAtom } from "jotai";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import {
  autoRefreshEnabledAtom,
  autoRefreshIntervalAtom,
  refreshIntervals,
  forceRefreshAtom } from "@/lib/auto-refresh-store";

export function AutoRefreshControls() {
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useAtom(
    autoRefreshEnabledAtom
  );
  const [autoRefreshInterval, setAutoRefreshInterval] = useAtom(
    autoRefreshIntervalAtom
  );
  const [, setForceRefresh] = useAtom(forceRefreshAtom);

  // URL state pour persister les préférences
  const [, setUrlAutoRefresh] = useQueryState("auto-refresh");

  const [, setUrlInterval] = useQueryState("interval");

  // Synchroniser avec l'URL state
  const handleAutoRefreshToggle = (enabled: boolean) => {
    setAutoRefreshEnabled(enabled);
    setUrlAutoRefresh(enabled.toString());
  };

  const handleIntervalChange = (interval: string) => {
    const intervalValue = parseInt(interval);
    setAutoRefreshInterval(intervalValue);
    setUrlInterval(intervalValue.toString());
  };

  const handleForceRefresh = () => {
    setForceRefresh(Date.now());
  };

  return (
    <div className="border-border bg-elevated rounded-card flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 border px-4 py-2">
      <div className="flex items-center gap-2.5">
        <Switch
          id="auto-refresh"
          checked={autoRefreshEnabled}
          onChange={(e) => handleAutoRefreshToggle(e.target.checked)}
        />
        <Label htmlFor="auto-refresh" className="text-sm font-medium">
          Actualisation automatique
        </Label>
      </div>

      {autoRefreshEnabled && (
        <div className="flex items-center gap-2">
          <Label htmlFor="interval" className="text-sm">
            Intervalle&nbsp;:
          </Label>
          <Select
            value={autoRefreshInterval.toString()}
            onValueChange={handleIntervalChange}
          >
            <SelectTrigger id="interval" size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {refreshIntervals.map((interval) => (
                <SelectItem
                  key={interval.value}
                  value={interval.value.toString()}
                >
                  {interval.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="ms-auto flex items-center gap-3">
        <span className="text-fg-muted text-xs">
          {autoRefreshEnabled ? "Activée" : "Désactivée"}
        </span>

        <Button variant="outline" size="sm" onClick={handleForceRefresh}>
          <RefreshCw aria-hidden />
          Actualiser
        </Button>
      </div>
    </div>
  );
}
