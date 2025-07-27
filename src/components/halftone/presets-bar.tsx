"use client";

import { useHalftoneStore } from "@/lib/halftone-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Trash2, Settings, Clock, Star } from "lucide-react";
import { toast } from "sonner";

export function PresetsBar() {
  const { presets, loadPreset, deletePreset } = useHalftoneStore();

  const presetNames = Object.keys(presets);

  if (presetNames.length === 0) {
    return null;
  }

  const handleLoadPreset = (name: string) => {
    loadPreset(name);
    toast.success(`Preset "${name}" chargé`);
  };

  const handleDeletePreset = (name: string) => {
    if (confirm(`Supprimer le preset "${name}" ?`)) {
      deletePreset(name);
      toast.success(`Preset "${name}" supprimé`);
    }
  };

  return (
    <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2">
      <div className="flex items-center space-x-2 overflow-x-auto">
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 px-2">
          <Star className="h-3 w-3" />
          <span>Presets:</span>
        </div>

        <AnimatePresence>
          {presetNames.map((name, index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-sm">
                <CardContent className="p-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLoadPreset(name)}
                      className="h-6 px-2 text-xs"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      {name}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePreset(name)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
