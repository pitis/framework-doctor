<script lang="ts">
  import DoctorTestComponent from '../lib/DoctorTestComponent.svelte';

  // Separate state for demo
  let darkMode = $state(false);

  function toggleDarkMode() {
    darkMode = !darkMode;
  }

  // === INTENTIONAL ISSUES FOR SVELTE-DOCTOR TESTING ===
  let unusedState = $state(42);

  console.log('Page rendered');

  let userRenderedContent = $state('<img src="invalid:" onerror="alert(1)">');
  let dynamicJsUrl = $state('javascript:void(0)');
</script>

<div class="container">
  <h1>Framework Doctor Demo</h1>
  <p>A minimal SvelteKit app with intentional issues for svelte-doctor testing.</p>

  <div class="example">
    <button type="button" onclick={toggleDarkMode}>
      {darkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  </div>

  <hr />
  <h2>svelte-doctor test section (intentional issues)</h2>
  <div class="example">
    {#each ['a', 'b', 'c'] as item}
      <span>{item}</span>
    {/each}

    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />

    <div role="button" onclick={() => (darkMode = !darkMode)}>
      Toggle (div, no keyboard)
    </div>

    <a href="#"> </a>

    <p>Unused state value: {unusedState}</p>

    <DoctorTestComponent label="Legacy" />

    {@html userRenderedContent}

    <a href="javascript:alert('XSS')">Click me (javascript: URL)</a>
    <a href={dynamicJsUrl}>Dynamic JS URL</a>
  </div>
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .example {
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }

  hr {
    margin: 2rem 0;
    border: none;
    border-top: 1px solid #e0e0e0;
  }
</style>
