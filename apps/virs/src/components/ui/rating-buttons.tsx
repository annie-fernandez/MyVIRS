"use client";

import { Tooltip, UnstyledButton } from "@mantine/core";
import type { RatingValue } from "@repo/core";
import { RATING_SCALE } from "@/theme/rating-scale";
import classes from "./rating-buttons.module.css";

interface RatingButtonsProps {
  value: RatingValue | null;
  onChange: (value: RatingValue) => void;
  /** The word being rated, for screen readers. */
  word: string;
  disabled?: boolean;
}

/** The five-step "how well do you know this word" control. Numbers on the buttons, labels on hover. */
export function RatingButtons({ value, onChange, word, disabled }: RatingButtonsProps) {
  return (
    <div className={classes.rating} role="radiogroup" aria-label={`How well do you know "${word}"?`}>
      {RATING_SCALE.map((step) => (
        <Tooltip key={step.value} label={step.label}>
          <UnstyledButton
            className={classes.ratingStep}
            role="radio"
            aria-checked={value === step.value}
            aria-label={step.label}
            data-selected={value === step.value || undefined}
            disabled={disabled}
            onClick={() => onChange(step.value)}
          >
            {step.value}
          </UnstyledButton>
        </Tooltip>
      ))}
    </div>
  );
}
