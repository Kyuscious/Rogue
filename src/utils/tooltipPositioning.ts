/**
 * Calculate smart tooltip position with viewport boundary detection
 * Prevents tooltips from going off-screen by repositioning them intelligently
 */
export function calculateTooltipPosition(
  triggerRect: DOMRect,
  tooltipWidth: number = 300,
  tooltipHeight: number = 200,
  offset: number = 10
): { x: number; y: number; placement: 'right' | 'left' | 'bottom' | 'top' } {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Default position: right of trigger
  let x = triggerRect.right + offset;
  let y = triggerRect.top;
  let placement: 'right' | 'left' | 'bottom' | 'top' = 'right';

  // Check if tooltip would go off right edge
  if (x + tooltipWidth > viewport.width) {
    // Try positioning on left
    if (triggerRect.left - tooltipWidth - offset > 0) {
      x = triggerRect.left - tooltipWidth - offset;
      placement = 'left';
    } else {
      // Position below if both sides fail
      x = Math.max(offset, Math.min(triggerRect.left, viewport.width - tooltipWidth - offset));
      y = triggerRect.bottom + offset;
      placement = 'bottom';
    }
  }

  // Check if tooltip would go off bottom edge
  if (y + tooltipHeight > viewport.height) {
    // Reposition to top if it was going off bottom
    if (triggerRect.top - tooltipHeight - offset > 0) {
      y = triggerRect.top - tooltipHeight - offset;
      placement = 'top';
    } else {
      // If still not fitting, just position at bottom of viewport
      y = Math.max(offset, viewport.height - tooltipHeight - offset);
    }
  }

  return { x, y, placement };
}
