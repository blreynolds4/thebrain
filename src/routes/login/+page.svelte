<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let mode = $state<'login' | 'register'>('login');
</script>

<div class="auth-container">
  <div class="auth-card">
    <h1>🧠 TheBrain</h1>
    <p class="subtitle">Your personal knowledge base</p>

    <div class="tabs">
      <button
        class:active={mode === 'login'}
        onclick={() => (mode = 'login')}
        type="button"
      >Login</button>
      <button
        class:active={mode === 'register'}
        onclick={() => (mode = 'register')}
        type="button"
      >Register</button>
    </div>

    {#if form?.error && form?.action === mode}
      <div class="error-message">{form.error}</div>
    {/if}

    {#if mode === 'login'}
      <form method="POST" action="?/login" use:enhance>
        <div class="field">
          <label for="username">Username</label>
          <input id="username" name="username" type="text" autocomplete="username" required />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required />
        </div>
        <button type="submit" class="btn-primary submit-btn">Login</button>
      </form>
    {:else}
      <form method="POST" action="?/register" use:enhance>
        <div class="field">
          <label for="reg-username">Username</label>
          <input id="reg-username" name="username" type="text" autocomplete="username" required minlength="3" />
        </div>
        <div class="field">
          <label for="reg-password">Password</label>
          <input id="reg-password" name="password" type="password" autocomplete="new-password" required minlength="8" />
        </div>
        <button type="submit" class="btn-primary submit-btn">Create Account</button>
      </form>
    {/if}
  </div>
</div>

<style>
  .auth-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }

  .auth-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }

  h1 {
    font-size: 1.8rem;
    text-align: center;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    color: var(--text-muted);
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    background: var(--bg);
    border-radius: var(--radius);
    padding: 0.25rem;
  }

  .tabs button {
    flex: 1;
    background: transparent;
    color: var(--text-muted);
    border-radius: calc(var(--radius) - 2px);
    padding: 0.4rem;
  }

  .tabs button.active {
    background: var(--accent);
    color: white;
  }

  .field {
    margin-bottom: 1rem;
  }

  .field label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 0.25rem;
  }

  .submit-btn {
    width: 100%;
    padding: 0.6rem;
    margin-top: 0.5rem;
    font-size: 1rem;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid var(--danger);
    color: var(--danger);
    border-radius: var(--radius);
    padding: 0.75rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
</style>
