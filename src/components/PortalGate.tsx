"use client";

import { useState } from "react";
import { Portal } from "./Portal";
import { useFremdrift } from "@/lib/fremdrift/store";

export function PortalGate() {
  const { tilstand, lastet } = useFremdrift();
  const [lukket, setLukket] = useState(false);

  if (!lastet) return null;
  if (tilstand.konto) return null;
  if (lukket) return null;

  return <Portal onFerdig={() => setLukket(true)} />;
}
