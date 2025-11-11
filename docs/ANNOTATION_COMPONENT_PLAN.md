# New Annotation Component - Complete Rebuild

## Problem Analysis

Current implementation fails to:

- Render annotations inline with proper visual tags as shown in design reference
- Provide reliable text selection in Notes mode
- Distinguish between viewing and creating annotations

## Solution: New Custom Component - Clean & Contextual

### 1. Core Component: AnnotationTextView

Create `src/components/editor/AnnotationTextView.tsx` - a completely new component built from scratch.

**Responsibilities:**

- Parse content with `[[ann:id]]text[[/ann]]` markers
- Render text using React Native Text with inline styled spans
- Display annotation tags inline (highlight + badges + icons) per design
- Handle tap-to-select for creating new annotations
- Show selection toolbar contextually when text is selected

**Key Features:**

- Uses nested Text components for inline rendering
- Highlighted text with coral/pink background
- Inline badges: label icons, edit icon, audio icon
- Tap detection on plain text to start selection
- Sentence/word detection for smart selection boundaries
- Adjustable selection with drag handles
- Toolbar appears above selection with "Annotate" action

**NO floating buttons** - everything is contextual and inline

### 2. Text Rendering Strategy

**For annotated segments:**

```tsx
<Text>
  Plain text here{' '}
  <Text style={highlightStyle}>
    highlighted text
  </Text>
  <View style={inlineBadges}>
    <Badge icon="tag">Expandir</Badge>
    <IconBadge icon="mic" />
    <IconBadge icon="edit" />
  </View>
  {' '}more text
</Text>
```

**Layout approach:**

- Use flexWrap to handle text flow naturally
- Position badges inline using flexDirection: row
- Each annotation segment = highlight + badges in a row

### 3. Selection System

**Tap behavior:**

- Tap on plain text → Detect word/sentence boundaries → Show initial selection
- Render custom selection handles (draggable circles)
- Drag handles → Adjust selection range
- Toolbar appears above selection with "Annotate" button
- Tap "Annotate" → Opens popup to add labels/notes
- Tap outside selection → Deselect

**Tap on existing annotation:**

- Shows popup to view/edit annotation
- Can add more labels or notes directly
- Quick and objective - no extra buttons needed

**Implementation:**

- Track character positions using onLayout measurements
- Use PanGesturer for handle dragging
- Calculate selection range based on handle positions
- Snap to word boundaries for cleaner selections

### 4. Component Props

```typescript
interface AnnotationTextViewProps {
  content: string; // With [[ann:id]]text[[/ann]] markers
  plainContent: string; // Without markers (for selection calc)
  annotations: Map<string, AnnotationWithLabels>;
  onAnnotationPress: (markerId: string) => void;
  onCreateAnnotation: (text: string, start: number, end: number) => void;
  editable: boolean; // true in Notes mode, false in Edit mode
}
```

### 5. Parser Improvements

Fix `src/utils/annotationParser.ts`:

- Validate all markers before parsing
- Handle malformed markers gracefully (show as plain text)
- Add comprehensive error logging
- Ensure stripMarkers works correctly for selection

### 6. Integration

Update `app/editor/[id].tsx`:

- EDIT mode: Keep current TextInput
- NOTES mode: Use new AnnotationTextView
- Remove all floating buttons
- Keep AnnotationPopup for adding/editing labels/notes
- Popup opens contextually (from selection or tap on annotation)

### 7. Styling (per design reference)

**Highlighted text:**

- Background: #FFD9D2 (coral pink)
- Padding: 2px horizontal
- Border radius: 3px

**Badges:**

- Background: #FFE6E1 (lighter pink)
- Border radius: 12px
- Padding: 4px 8px
- Icon + text layout

**Icons:**

- Tag icon for labels
- Mic icon for audio notes
- Edit icon for text notes
- Size: 14-16px

**Selection UI:**

- Handles: Blue circles with white border
- Toolbar: Floating card above selection
- Simple "Annotate" button in toolbar

### 8. Files to Create/Modify

**New files:**

- `src/components/editor/AnnotationTextView.tsx` - Main component
- `src/components/editor/SelectionHandle.tsx` - Draggable handles
- `src/components/editor/SelectionToolbar.tsx` - Floating annotate button (only when selecting)

**Modified files:**

- `app/editor/[id].tsx` - Replace Notes mode rendering, remove floating buttons
- `src/utils/annotationParser.ts` - Fix edge cases
- `src/components/editor/NotesView.tsx` - Delete (no longer needed)

**Documentation:**

- Save plan copy to `docs/ANNOTATION_COMPONENT_PLAN.md`

### 9. Edge Cases to Handle

- Overlapping annotations (not supported, show warning)
- Malformed markers (render as plain text)
- Empty annotations (skip rendering)
- Very long annotations (ensure proper wrapping)
- Selection at document boundaries (prevent overflow)
- Tapping very close to existing annotations (prioritize annotation tap)

### 10. Success Criteria

- Annotations render inline with highlights and badges matching design
- Tap on plain text shows selection with handles and toolbar
- Drag handles adjusts selection smoothly
- "Annotate" in toolbar creates annotation via popup
- Tap existing annotation opens edit popup
- No raw markers `[[ann:a]]` visible to user
- No floating buttons - everything contextual
- Clean, objective, fast UX
- Works reliably on both iOS and Android

