# Svelte 5 Migration

Framework Doctor encourages Svelte 5 patterns where applicable.

## Migration Table

| Old (Svelte 4)           | New (Svelte 5)              |
| ------------------------ | --------------------------- |
| `export let prop`        | `$props()`                  |
| `onMount` for reactivity | `$effect()`                 |
| `createEventDispatcher`  | Callback props              |
| `<slot />`               | `{@render children()}`      |
| `{#each} without key`    | Add key to `{#each}` blocks |

## Examples

### Props

```svelte
<!-- Old -->
<script>
  export let name;
  export let count = 0;
</script>

<!-- New -->
<script>
  let { name, count = 0 } = $props();
</script>
```

### Reactivity

```svelte
<!-- Old - onMount for side effects -->
<script>
  import { onMount } from "svelte";
  onMount(() => {
    fetchData();
  });
</script>

<!-- New - $effect for reactivity -->
<script>
  $effect(() => {
    fetchData();
  });
</script>
```

### Slots

```svelte
<!-- Old -->
<slot />

<!-- New -->
{@render children()}
```

### each Blocks

```svelte
<!-- Old - missing key -->
{#each items as item}
  <div>{item.name}</div>
{/each}

<!-- New - with key -->
{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}
```
