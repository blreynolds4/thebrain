<script lang="ts">
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<svelte:head>
  <title>TheBrain</title>
</svelte:head>

<div class="app">
  <nav>
    <a href="/" class="logo">🧠 TheBrain</a>
    <div class="nav-actions">
      {#if data.user}
        <span class="username">{data.user.username}</span>
        <form method="POST" action="/logout">
          <button type="submit" class="btn-ghost">Logout</button>
        </form>
      {:else}
        <a href="/login" class="btn-ghost">Login</a>
      {/if}
    </div>
  </nav>
  <main>
    {@render children()}
  </main>
</div>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(:root) {
    --bg: #0f172a;
    --card: #1e293b;
    --text: #e2e8f0;
    --text-muted: #94a3b8;
    --accent: #6366f1;
    --accent-hover: #4f46e5;
    --border: #334155;
    --danger: #ef4444;
    --success: #22c55e;
    --radius: 8px;
    --font: system-ui, -apple-system, sans-serif;
  }

  :global(body) {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font);
    min-height: 100vh;
  }

  :global(input, textarea, select) {
    background: var(--bg);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.5rem 0.75rem;
    font-family: var(--font);
    font-size: 0.9rem;
    width: 100%;
    outline: none;
    transition: border-color 0.2s;
  }

  :global(input:focus, textarea:focus, select:focus) {
    border-color: var(--accent);
  }

  :global(button) {
    cursor: pointer;
    font-family: var(--font);
    font-size: 0.9rem;
    border: none;
    border-radius: var(--radius);
    padding: 0.5rem 1rem;
    transition: background 0.2s, opacity 0.2s;
  }

  :global(.btn-primary) {
    background: var(--accent);
    color: white;
  }

  :global(.btn-primary:hover) {
    background: var(--accent-hover);
  }

  :global(.btn-ghost) {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
  }

  :global(.btn-ghost:hover) {
    background: var(--card);
  }

  :global(.btn-danger) {
    background: transparent;
    color: var(--danger);
    border: 1px solid var(--danger);
  }

  :global(.btn-danger:hover) {
    background: var(--danger);
    color: white;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  nav {
    background: var(--card);
    border-bottom: 1px solid var(--border);
    padding: 0 1.5rem;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .logo {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--text);
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .username {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  nav form {
    display: inline;
  }

  main {
    flex: 1;
    padding: 2rem 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
</style>
