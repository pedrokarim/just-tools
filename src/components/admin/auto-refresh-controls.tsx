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
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RefreshCw, Play, Pause } from "lucide-react";
import {
  autoRefreshEnabledAtom,
  autoRefreshIntervalAtom,
  refreshIntervals,
  forceRefreshAtom,
} from "@/lib/auto-refresh-store";

export function AutoRefreshControls() {
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useAtom(
    autoRefreshEnabledAtom
  );
  const [autoRefreshInterval, setAutoRefreshInterval] = useAtom(
    autoRefreshIntervalAtom
  );
  const [, setForceRefresh] = useAtom(forceRefreshAtom);

  // URL state pour persister les préférences
  const [urlAutoRefresh, setUrlAutoRefresh] = useQueryState("auto-refresh", {
    defaultValue: "false",
    parse: (value) => value === "true",
    serialize: (value) => value.toString(),
  });

  const [urlInterval, setUrlInterval] = useQueryState("interval", {
    defaultValue: "30",
    parse: (value) => parseInt(value) || 30,
    serialize: (value) => value.toString(),
  });

  // Synchroniser avec l'URL state
  const handleAutoRefreshToggle = (enabled: boolean) => {
    setAutoRefreshEnabled(enabled);
    setUrlAutoRefresh(enabled);
  };

  const handleIntervalChange = (interval: string) => {
    const intervalValue = parseInt(interval);
    setAutoRefreshInterval(intervalValue);
    setUrlInterval(intervalValue);
  };

  const handleForceRefresh = () => {
    setForceRefresh(Date.now());
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
      <div className="flex items-center space-x-2">
        <Switch
          id="auto-refresh"
          checked={autoRefreshEnabled}
          onCheckedChange={handleAutoRefreshToggle}
        />
        <Label htmlFor="auto-refresh" className="text-sm font-medium">
          Auto-refresh
        </Label>
      </div>

      {autoRefreshEnabled && (
        <div className="flex items-center space-x-2">
          <Label htmlFor="interval" className="text-sm">
            Intervalle:
          </Label>
          <Select
            value={autoRefreshInterval.toString()}
            onValueChange={handleIntervalChange}
          >
            <SelectTrigger className="w-32">
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

      <div className="flex items-center space-x-2 ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleForceRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {autoRefreshEnabled ? (
            <>
              <Play className="h-3 w-3 text-green-500" />
              <span>Actif</span>
            </>
          ) : (
            <>
              <Pause className="h-3 w-3 text-gray-500" />
              <span>Inactif</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
