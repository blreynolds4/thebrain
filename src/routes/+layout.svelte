<script lang="ts">
  import '../app.css';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<svelte:head>
  <title>TheBrain</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-slate-950 text-slate-200">
  <nav class="bg-slate-800 border-b border-slate-700 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
    <a href="/" class="text-xl font-bold text-slate-200 no-underline tracking-tight">🧠 TheBrain</a>
    <div class="flex items-center gap-4">
      {#if data.user}
        <span class="text-slate-400 text-sm">{data.user.username}</span>
        <form method="POST" action="/logout" class="inline">
          <button type="submit" class="text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-transparent hover:bg-slate-700 cursor-pointer">Logout</button>
        </form>
      {:else}
        <a href="/login" class="text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 text-sm hover:bg-slate-700">Login</a>
      {/if}
    </div>
  </nav>
  <main class="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
    {@render children()}
  </main>
</div>
