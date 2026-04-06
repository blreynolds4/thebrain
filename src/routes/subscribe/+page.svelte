<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="flex items-center justify-center min-h-[70vh]">
  <div class="bg-slate-800 border border-slate-700 rounded-lg p-8 w-full max-w-md text-center">
    <div class="text-5xl mb-4">🧠</div>
    <h1 class="text-2xl font-bold mb-2">TheBrain Pro</h1>
    <p class="text-slate-400 text-sm mb-6">Unlock unlimited thoughts, full-text search, and more.</p>

    <div class="bg-slate-950 rounded-xl p-6 mb-6 border border-slate-700">
      <div class="text-4xl font-bold text-indigo-400 mb-1">$9<span class="text-lg text-slate-400 font-normal">/month</span></div>
      <ul class="text-sm text-slate-400 space-y-2 mt-4 text-left">
        <li class="flex items-center gap-2"><span class="text-indigo-400">✓</span> Unlimited thoughts</li>
        <li class="flex items-center gap-2"><span class="text-indigo-400">✓</span> Full-text search</li>
        <li class="flex items-center gap-2"><span class="text-indigo-400">✓</span> URL thumbnails</li>
        <li class="flex items-center gap-2"><span class="text-indigo-400">✓</span> Tag filtering</li>
        <li class="flex items-center gap-2"><span class="text-indigo-400">✓</span> Cancel anytime</li>
      </ul>
    </div>

    {#if form?.error}
      <div class="bg-red-500/15 border border-red-400 text-red-400 rounded-lg p-3 mb-4 text-sm">{form.error}</div>
    {/if}

    {#if data.subscriptionStatus === 'active' || data.subscriptionStatus === 'trialing'}
      <div class="bg-green-500/15 border border-green-500 text-green-400 rounded-lg p-3 mb-4 text-sm">
        ✓ You have an active subscription!
      </div>
      <a href="/" class="block w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg text-sm font-medium transition-colors no-underline">Go to My Thoughts →</a>
    {:else}
      <form method="POST" action="?/checkout" use:enhance>
        <button
          type="submit"
          class="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg text-sm font-medium cursor-pointer border-0 transition-colors"
        >Subscribe Now — $9/month</button>
      </form>
    {/if}

    <p class="text-slate-500 text-xs mt-4">Secure payment powered by Stripe. Cancel anytime.</p>
  </div>
</div>
