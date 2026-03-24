/**
 * TagInput Component (Atom)
 * Reusable tag/chip input for arrays of strings.
 * Used for: handoff_keywords in bot_configs, contact tags, etc.
 *
 * Supports:
 * - Enter/comma to add tags
 * - Click X or Backspace on empty input to remove last tag
 * - Duplicate prevention
 * - Maximum tag count enforcement
 */
"use client";
import React, { useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  /** Current tag values */
  value: string[];
  /** Callback when tags change */
  onChange: (tags: string[]) => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Maximum number of tags allowed */
  maxTags?: number;
  /** Label text */
  label?: string;
  /** Icon component to display */
  icon?: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export default function TagInput({
  value,
  onChange,
  placeholder = "Type and press Enter...",
  maxTags = 20,
  label,
  icon,
  className,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (!trimmed) return;
      if (value.includes(trimmed)) return; // Deduplicate
      if (value.length >= maxTags) return;
      onChange([...value, trimmed]);
      setInputValue("");
    },
    [value, onChange, maxTags]
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(inputValue);
      } else if (
        e.key === "Backspace" &&
        !inputValue &&
        value.length > 0
      ) {
        removeTag(value.length - 1);
      }
    },
    [inputValue, value, addTag, removeTag]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="text-[11px] font-black text-text-dim uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
          {icon}
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 min-h-[60px] bg-foreground/[0.03] border border-glass-border rounded-2xl px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-accent-primary/30 cursor-text",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => inputRef.current?.focus()}
        role="listbox"
        aria-label={label || "Tags"}
      >
        {value.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-accent-primary/10 border border-accent-primary/20 rounded-xl text-[12px] font-bold text-accent-primary animate-in zoom-in-95 duration-200"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="p-0.5 hover:bg-accent-primary/20 rounded-md transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={disabled || value.length >= maxTags}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-[14px] text-foreground placeholder:text-text-dim/50 font-medium py-1"
          aria-label="Add tag"
        />
      </div>
      {maxTags && (
        <div className="text-[9px] font-bold text-text-dim uppercase tracking-widest ml-2">
          {value.length}/{maxTags} tags
        </div>
      )}
    </div>
  );
}
