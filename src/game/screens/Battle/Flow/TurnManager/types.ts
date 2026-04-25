export interface TurnLineCollector {
  familiarTurnLineParts: string[];
  familiarTurnLineTooltips: string[];
  statusTurnLineParts: string[];
  statusTurnLineTooltips: string[];
}

export function createTurnLineCollector(): TurnLineCollector {
  return {
    familiarTurnLineParts: [],
    familiarTurnLineTooltips: [],
    statusTurnLineParts: [],
    statusTurnLineTooltips: [],
  };
}

export function pushStatusLine(collector: TurnLineCollector, message: string, tooltip: string): void {
  collector.statusTurnLineParts.push(message);
  collector.statusTurnLineTooltips.push(tooltip);
}

export function pushFamiliarLine(collector: TurnLineCollector, message: string, tooltip: string): void {
  collector.familiarTurnLineParts.push(message);
  collector.familiarTurnLineTooltips.push(tooltip);
}
