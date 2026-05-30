# Repository Guidelines

## Stack

- React 19
- Typescript 5
- Vite 7
- TailwindCSS 4
- TanStack Query v5
- TanStack Router v1
- Zustand v5
- React Hook Form v7 + Zod
- shadcn/ui

## Project Structure

```txt
src/
├── client/        # generated OpenAPI client
├── lib/           # infrastructure/setup
├── stores/        # Zustand stores
├── components/
│   ├── ui/        # primitive UI
│   └── common/    # shared business components
├── features/      # domain-based modules
└── routes/        # TanStack Router routes
```

### Rules

- `routes/` should stay thin.
- Business logic belongs in `features/`.
- Shared reusable components go to `components/common`.
- Primitive UI components go to `components/ui`.
- Never edit `src/client` manually.

Do not import internal files across features. Move shared code into `components/common`.

---

## Development Commands

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run gen
```

- Run lint + format after changes.
- `npm run gen` requires backend OpenAPI server running.

## Typescript

- Never use `any`.
- Avoid unsafe `as`.
- Prefer inferred types from generated OpenAPI types.
- Use `satisfies` for config objects.
- Use `@ts-expect-error` instead of `@ts-ignore`.

---

## Components

- Use function declarations for top-level components.
- Keep business logic inside hooks.
- Always handle loading/error/empty states.
- Prefer skeletons over spinners.
- Avoid props drilling beyond 2 levels.
- Avoid `index.tsx` for component filenames.

```tsx
// GOOD
export default function StoreCard(props: Props) {
  return <div />
}

// BAD
const StoreCard = (props: Props) => {
  return <div />
}
```

React 19:

- Prefer `ref` as prop for new components.
- Avoid legacy `forwardRef` unless necessary.

## Reusable Components

When the same UI pattern appears more than once,
extract it into a reusable component.

Prefer:

- components/common/
- shadcn/ui primitives

Avoid duplicating UI implementation across features.

---

## State Management

### Source of truth

| State Type          | Location                      |
| ------------------- | ----------------------------- |
| Server state        | TanStack Query                |
| Global client state | Zustand                       |
| Form state          | React Hook Form               |
| URL state           | TanStack Router search params |
| Local UI state      | useState                      |

### Rules

- Do not duplicate TanStack Query data into Zustand or `useState`.
- Avoid manual `useEffect` fetching.
- Subscribe to Zustand slices only.
- Use `useShallow` when selector returns objects/arrays.
- Persist state only, never actions/functions.

```tsx
// GOOD
const { items, total } = useCartStore(
  useShallow((s) => ({
    items: s.items,
    total: s.total,
  })),
)

// BAD
const { items, total } = useCartStore((s) => ({
  items: s.items,
  total: s.total,
}))
```

Store filters/pagination in URL search params, not local state.

## TanStack Query v5

- Prefer generated `queryOptions` from hey-api.
- Prefer `useSuspenseQuery` for happy-path components.
- Use route loaders + `ensureQueryData` for prefetching.
- Use generated `.queryKey` for invalidation.
- Use `isPending` instead of `isLoading`.

```tsx
// GOOD
useQuery(getStoreByIdOptions({ path: { id } }))

queryClient.invalidateQueries({
  queryKey: getStoreByIdOptions({ path: { id } }).queryKey,
})
```

Avoid:

- manual query key factories,
- manual `useEffect` fetching,
- `enabled: false` as error suppression.

---

## Routing (TanStack Router v1)

- Use `beforeLoad` for auth/role guards.
- Use `validateSearch` for typed search params.
- Prefer typed navigation.

```tsx
// GOOD
navigate({
  to: '/student/stores/$storeId',
  params: { storeId },
})

// BAD
navigate('/student/stores/' + storeId)
```

## Forms

- Zod schema is the single source of truth.
- Use `handleSubmit`.
- Reset forms only after successful mutations.

React 19:

- `useActionState` is acceptable for simple forms.
- Use React Hook Form + Zod for complex forms.

## Performance

- TanStack Router handles route-based code splitting automatically.
- Use `React.lazy` for heavy conditional components.
- Use virtualization for large lists.
- Use `useMemo` / `useCallback` selectively.

React 19:

- `use()` is allowed for promise-based loader data.

## Naming Conventions

| Type             | Convention           |
| ---------------- | -------------------- |
| Files            | kebab-case           |
| Components       | PascalCase           |
| Hooks/functions  | camelCase            |
| Constants        | SCREAMING_SNAKE_CASE |
| Types/interfaces | PascalCase           |

Use barrel exports only at feature root level.

```tsx
// GOOD
import { CatalogPage } from '@/features/student/catalog'

// BAD
import { StoreCard } from '@/features/student/catalog/components/store-card'
```

## Error Handling

- Use Error Boundaries per section/page.
- Handle API auth errors globally via interceptor.
- Do not leave `console.log` in production code.
