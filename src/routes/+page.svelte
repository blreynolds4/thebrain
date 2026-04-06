<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { PageData, ActionData } from './$types';
  import type { Thought } from '$lib/types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let searchQuery = $state(data.query || '');
  let selectedTags = $state<string[]>(data.selectedTags || []);
  let showModal = $state(false);
  let editingThought = $state<Thought | null>(null);

  let formTitle = $state('');
  let formContent = $state('');
  let formUrl = $state('');
  let formTags = $state('');

  function openCreate() {
    editingThought = null;
    formTitle = '';
    formContent = '';
    formUrl = '';
    formTags = '';
    showModal = true;
  }

  function openEdit(thought: Thought) {
    editingThought = thought;
    formTitle = thought.title;
    formContent = thought.content;
    formUrl = thought.url || '';
    formTags = thought.tags.join(', ');
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    editingThought = null;
  }

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter(t => t !== tag);
    } else {
      selectedTags = [...selectedTags, tag];
    }
    applyFilters();
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    goto(`/?${params.toString()}`, { replaceState: true });
  }

  function handleSearchKey(e: KeyboardEvent) {
    if (e.key === 'Enter') applyFilters();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  $effect(() => {
    if (form?.success) {
      closeModal();
    }
  });
</script>

<div class="max-w-5xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">My Thoughts</h1>
    <button
      class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-0 transition-colors"
      onclick={openCreate}
    >+ New Thought</button>
  </div>

  <div class="flex gap-3 mb-4">
    <input
      type="search"
      placeholder="Search thoughts..."
      bind:value={searchQuery}
      onkeydown={handleSearchKey}
      class="flex-1 bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
    />
    <button
      class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-0 transition-colors"
      onclick={applyFilters}
    >Search</button>
  </div>

  {#if data.allTags.length > 0}
    <div class="flex flex-wrap gap-2 mb-6 items-center">
      {#each data.allTags as tag}
        <button
          class="rounded-full px-3 py-1 text-xs border transition-all cursor-pointer {selectedTags.includes(tag) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-indigo-500'}"
          onclick={() => toggleTag(tag)}
          type="button"
        >{tag}</button>
      {/each}
      {#if selectedTags.length > 0}
        <button
          class="text-slate-400 text-xs px-2 py-1 bg-transparent border-0 cursor-pointer hover:text-slate-200"
          onclick={() => { selectedTags = []; applyFilters(); }}
          type="button"
        >✕ Clear filters</button>
      {/if}
    </div>
  {/if}

  {#if data.thoughts.length === 0}
    <div class="text-center py-16 text-slate-400">
      <p>No thoughts yet.{data.query || data.selectedTags.length > 0 ? ' Try different search terms.' : ' Create your first thought!'}</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each data.thoughts as thought (thought.id)}
        <div class="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden flex flex-col hover:border-indigo-500 transition-colors">
          {#if thought.thumbnailUrl}
            <div class="h-28 overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={thought.thumbnailUrl}
                alt="thumbnail"
                class="w-full h-full object-cover"
                onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          {/if}
          <div class="p-4 flex-1 flex flex-col gap-2">
            <div class="flex justify-between items-start gap-2">
              <h3 class="text-sm font-semibold leading-snug flex-1">{thought.title}</h3>
              <div class="flex gap-1 shrink-0">
                <button
                  class="text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-xs bg-transparent hover:bg-slate-700 cursor-pointer"
                  onclick={() => openEdit(thought)}
                  type="button"
                >Edit</button>
                <form method="POST" action="?/delete" use:enhance class="inline">
                  <input type="hidden" name="id" value={thought.id} />
                  <button
                    type="submit"
                    class="text-red-400 border border-red-400 rounded px-2 py-0.5 text-xs bg-transparent hover:bg-red-400 hover:text-white cursor-pointer transition-colors"
                  >Delete</button>
                </form>
              </div>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed flex-1">{thought.content.slice(0, 200)}{thought.content.length > 200 ? '...' : ''}</p>
            {#if thought.url}
              <a
                href={thought.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-indigo-400 text-xs no-underline hover:underline truncate block"
              >🔗 {new URL(thought.url).hostname}</a>
            {/if}
            {#if thought.tags.length > 0}
              <div class="flex flex-wrap gap-1">
                {#each thought.tags as tag}
                  <span class="bg-indigo-500/15 text-indigo-400 rounded-full px-2 py-0.5 text-xs">{tag}</span>
                {/each}
              </div>
            {/if}
            <span class="text-slate-500 text-xs mt-auto">{formatDate(thought.updatedAt)}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showModal}
  <div
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    onclick={closeModal}
    role="presentation"
  >
    <div
      class="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div class="flex justify-between items-center mb-5">
        <h2 class="text-lg font-semibold">{editingThought ? 'Edit Thought' : 'New Thought'}</h2>
        <button
          class="text-slate-400 bg-transparent border-0 text-lg leading-none cursor-pointer hover:text-slate-200 p-1"
          onclick={closeModal}
          type="button"
        >✕</button>
      </div>

      {#if form?.error && (form?.action === 'create' || form?.action === 'update')}
        <div class="bg-red-500/15 border border-red-400 text-red-400 rounded-lg p-3 mb-4 text-sm">{form.error}</div>
      {/if}

      <form method="POST" action={editingThought ? '?/update' : '?/create'} use:enhance>
        {#if editingThought}
          <input type="hidden" name="id" value={editingThought.id} />
        {/if}

        <div class="mb-4">
          <label for="title" class="block text-xs text-slate-400 mb-1">Title *</label>
          <input
            id="title" name="title" type="text"
            bind:value={formTitle} required
            placeholder="Enter title..."
            class="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div class="mb-4">
          <label for="content" class="block text-xs text-slate-400 mb-1">Content *</label>
          <textarea
            id="content" name="content" rows="5"
            bind:value={formContent} required
            placeholder="Write your thought..."
            class="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors resize-y min-h-24"
          ></textarea>
        </div>

        <div class="mb-4">
          <label for="url" class="block text-xs text-slate-400 mb-1">URL (optional)</label>
          <input
            id="url" name="url" type="url"
            bind:value={formUrl}
            placeholder="https://..."
            class="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div class="mb-4">
          <label for="tags" class="block text-xs text-slate-400 mb-1">Tags (comma-separated)</label>
          <input
            id="tags" name="tags" type="text"
            bind:value={formTags}
            placeholder="tag1, tag2, tag3"
            class="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div class="flex justify-end gap-3 mt-5">
          <button
            type="button"
            class="text-slate-200 border border-slate-700 rounded-lg px-4 py-2 text-sm bg-transparent hover:bg-slate-700 cursor-pointer"
            onclick={closeModal}
          >Cancel</button>
          <button
            type="submit"
            class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-0 transition-colors"
          >{editingThought ? 'Save Changes' : 'Create Thought'}</button>
        </div>
      </form>
    </div>
  </div>
{/if}
