<script lang="ts">
  /**
   * INTENTIONAL ISSUES FOR SVELTE-DOCTOR TESTING
   * This component uses Svelte 4 legacy patterns - remove after testing
   */

  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  // no-export-let: should use $props()
  export let label = 'Test';

  // no-event-dispatcher: should use callback props
  const dispatch = createEventDispatcher<{ submit: string }>();

  // no-legacy-lifecycle: should use $effect
  onMount(() => {
    console.log('Mounted');
    return () => console.log('Unmounted');
  });

  function handleClick() {
    dispatch('submit', label);
  }
</script>

<!-- no-legacy-slots: should use {@render children()} -->
<slot />

<button onclick={handleClick} type="button">{label}</button>
