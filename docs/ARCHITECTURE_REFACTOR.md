# Architecture & Code Quality Improvements

## 1. Refactor `EditorNew.tsx` (Critical)

### Current State
The `src/pages/EditorNew.tsx` file is currently monolithic, spanning over 3,200 lines. It tightly couples:
- **UI Rendering**: All sections (Social, Payment, Gallery, etc.) are in one file.
- **State Management**: Complex `useState` and `useEffect` hooks manage the entire card state.
- **Data Persistence**: Direct Supabase calls are mixed with UI logic.
- **Drag-and-Drop**: `dnd-kit` logic is embedded directly.

### Proposed Solution

#### A. Component Decomposition
Break the editor into smaller, focused components within `src/components/editor/`:
- `SocialLinksEditor.tsx`
- `PaymentLinksEditor.tsx`
- `PhotoGalleryEditor.tsx`
- `ProfileInfoEditor.tsx`
- `ThemeSelector.tsx`
- `SortableSectionList.tsx`

#### B. Custom Hooks
Extract state logic into a custom hook `useCardEditor`:
```typescript
// src/hooks/useCardEditor.ts
export const useCardEditor = (initialData) => {
  const [cardData, setCardData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  
  const updateField = (field, value) => { ... };
  const saveCard = async () => { ... };
  
  return { cardData, updateField, saveCard, saving };
};
```

#### C. Service Layer
Move all Supabase interactions to a dedicated service:
```typescript
// src/services/cardService.ts
export const CardService = {
  getCard: async (userId) => { ... },
  saveCard: async (cardData) => { ... },
  checkUrlAvailability: async (url) => { ... }
};
```

## 2. Type Safety Enhancements

### Current State
The codebase frequently uses `any` types (e.g., `payload: any`, `error: any`), bypassing TypeScript's safety benefits.

### Proposed Solution
1.  **Centralize Interfaces**: Move all interfaces from `EditorNew.tsx` to `src/types/card.ts`.
2.  **Strict Typing**:
    ```typescript
    // src/types/card.ts
    export interface CardData {
      fullName: string;
      // ... other fields
      socialLinks: SocialLink[];
    }
    ```
3.  **Supabase Types**: Generate types from your Supabase schema using the Supabase CLI to ensure database responses are strictly typed.
