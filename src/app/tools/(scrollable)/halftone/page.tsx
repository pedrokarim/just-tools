"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Download,
  Settings,
  Image as ImageIcon,
  Palette,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { HalftonePlayground } from "@/components/halftone/halftone-playground";

export default function HalftoneEffect() {
  return (
    <div className="h-screen w-full bg-background">
      <HalftonePlayground />
    </div>
  );
}
