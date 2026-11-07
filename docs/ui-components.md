# Filter components

The supplied animated ChipGroup lives at `src/components/ui/chip-group.tsx`.
This follows the existing `src/components/ui` convention. Its styles and motion
tokens live alongside it in `chip-group-utils/`. React, TypeScript, Motion and
Lucide are already installed. No new packages are needed.

Foodex uses plain CSS rather than Tailwind/shadcn. The supplied chip component
uses CSS modules, so it works directly without a Tailwind migration. Its demo's
Tailwind wrapper is not used. The missing CSS module and motion-token resources
were implemented locally and scoped to avoid overriding existing global tokens.

Settings supplies controlled values from the existing restriction IDs and
cuisine list. The profile shape and saving through the existing onSave callback
are unchanged. All four categories are visible together on one page. The scanner and menu open the editable preference page directly. Chip
groups support arrow keys, Home/End, Enter/Space, overflow expansion, and the
device's reduced-motion preference.
