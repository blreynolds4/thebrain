<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let mode = $state<'login' | 'register'>('login');
</script>

<div class="flex items-center justify-center min-h-[60vh]">
  <div class="bg-slate-800 border border-slate-700 rounded-lg p-8 w-full max-w-sm">
    <h1 class="text-2xl font-bold text-center mb-1">🧠 TheBrain</h1>
    <p class="text-slate-400 text-center text-sm mb-6">Your personal knowledge base</p>

    <div class="flex gap-2 mb-6 bg-slate-950 rounded-lg p-1">
      <button
        class="flex-1 rounded py-1.5 text-sm transition-colors cursor-pointer border-0 {mode === 'login' ? 'bg-indigo-500 text-white' : 'bg-transparent text-slate-400 hover:text-slate-200'}"
        onclick={() => (mode = 'login')}
        type="button"
      >Login</button>
      <button
        class="flex-1 rounded py-1.5 text-sm transition-colors cursor-pointer border-0 {mode === 'register' ? 'bg-indigo-500 text-white' : 'bg-transparent text-slate-400 hover:text-slate-200'}"
        onclick={() => (mode = 'register')}
        type="button"
      >Register</button>
    </div>

    {#if form?.error && form?.action === mode}
      <div class="bg-red-500/15 border border-red-400 text-red-400 rounded-lg p-3 mb-4 text-sm">{form.error}</div>
    {/if}

    {#if mode === 'login'}
      <form method="POST" action="?/login" use:enhance>
        <div class="mb-4">
          <label for="username" class="block text-xs text-slate-400 mb-1">Username</label>
          <input
            id="username" name="username" type="text"
            autocomplete="username" required
            class="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-xs text-slate-400 mb-1">Password</label>
          <input
            id="password" name="password" type="password"
            autocomplete="current-password" required
            class="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium cursor-pointer border-0 transition-colors mt-1"
        >Login</button>
      </form>
    {:else}
      <form method="POST" action="?/register" use:enhance>
        <div class="mb-4">
          <label for="reg-username" class="block text-xs text-slate-400 mb-1">Username</label>
          <input
            id="reg-username" name="username" type="text"
            autocomplete="username" required minlength="3"
            class="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div class="mb-4">
          <label for="reg-password" class="block text-xs text-slate-400 mb-1">Password</label>
          <input
            id="reg-password" name="password" type="password"
            autocomplete="new-password" required minlength="8"
            class="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium cursor-pointer border-0 transition-colors mt-1"
        >Create Account</button>
      </form>
    {/if}
  </div>
</div>
