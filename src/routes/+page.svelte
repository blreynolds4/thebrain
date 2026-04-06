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

  // Form fields
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

<div class="page">
  <div class="header">
    <h1>My Thoughts</h1>
    <button class="btn-primary" onclick={openCreate}>+ New Thought</button>
  </div>

  <div class="search-bar">
    <input
      type="search"
      placeholder="Search thoughts..."
      bind:value={searchQuery}
      onkeydown={handleSearchKey}
    />
    <button class="btn-primary" onclick={applyFilters}>Search</button>
  </div>

  {#if data.allTags.length > 0}
    <div class="tag-filters">
      {#each data.allTags as tag}
        <button
          class="tag-pill"
          class:active={selectedTags.includes(tag)}
          onclick={() => toggleTag(tag)}
          type="button"
        >{tag}</button>
      {/each}
      {#if selectedTags.length > 0}
        <button class="tag-clear" onclick={() => { selectedTags = []; applyFilters(); }} type="button">
          ✕ Clear filters
        </button>
      {/if}
    </div>
  {/if}

  {#if data.thoughts.length === 0}
    <div class="empty">
      <p>No thoughts yet.{data.query || data.selectedTags.length > 0 ? ' Try different search terms.' : ' Create your first thought!'}</p>
    </div>
  {:else}
    <div class="thoughts-grid">
      {#each data.thoughts as thought (thought.id)}
        <div class="thought-card">
          {#if thought.thumbnailUrl}
            <div class="card-thumbnail">
              <img src={thought.thumbnailUrl} alt="thumbnail" onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          {/if}
          <div class="card-body">
            <div class="card-header">
              <h3 class="card-title">{thought.title}</h3>
              <div class="card-actions">
                <button class="btn-ghost btn-sm" onclick={() => openEdit(thought)} type="button">Edit</button>
                <form method="POST" action="?/delete" use:enhance>
                  <input type="hidden" name="id" value={thought.id} />
                  <button type="submit" class="btn-danger btn-sm">Delete</button>
                </form>
              </div>
            </div>
            <p class="card-content">{thought.content.slice(0, 200)}{thought.content.length > 200 ? '...' : ''}</p>
            {#if thought.url}
              <a href={thought.url} target="_blank" rel="noopener noreferrer" class="card-url">
                🔗 {new URL(thought.url).hostname}
              </a>
            {/if}
            {#if thought.tags.length > 0}
              <div class="card-tags">
                {#each thought.tags as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </div>
            {/if}
            <span class="card-date">{formatDate(thought.updatedAt)}</span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if showModal}
  <div class="modal-overlay" onclick={closeModal} role="presentation">
    <div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
      <div class="modal-header">
        <h2>{editingThought ? 'Edit Thought' : 'New Thought'}</h2>
        <button class="modal-close" onclick={closeModal} type="button">✕</button>
      </div>

      {#if form?.error && (form?.action === 'create' || form?.action === 'update')}
        <div class="error-message">{form.error}</div>
      {/if}

      <form
        method="POST"
        action={editingThought ? '?/update' : '?/create'}
        use:enhance
      >
        {#if editingThought}
          <input type="hidden" name="id" value={editingThought.id} />
        {/if}

        <div class="field">
          <label for="title">Title *</label>
          <input id="title" name="title" type="text" bind:value={formTitle} required placeholder="Enter title..." />
        </div>

        <div class="field">
          <label for="content">Content *</label>
          <textarea id="content" name="content" rows="5" bind:value={formContent} required placeholder="Write your thought..."></textarea>
        </div>

        <div class="field">
          <label for="url">URL (optional)</label>
          <input id="url" name="url" type="url" bind:value={formUrl} placeholder="https://..." />
        </div>

        <div class="field">
          <label for="tags">Tags (comma-separated)</label>
          <input id="tags" name="tags" type="text" bind:value={formTags} placeholder="tag1, tag2, tag3" />
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-ghost" onclick={closeModal}>Cancel</button>
          <button type="submit" class="btn-primary">{editingThought ? 'Save Changes' : 'Create Thought'}</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .page {
    max-width: 1100px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.8rem;
    font-weight: 700;
  }

  .search-bar {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .search-bar input {
    flex: 1;
  }

  .tag-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    align-items: center;
  }

  .tag-pill {
    background: var(--card);
    color: var(--text-muted);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .tag-pill.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
  }

  .tag-clear {
    background: transparent;
    color: var(--text-muted);
    border: none;
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }

  .empty {
    text-align: center;
    padding: 4rem;
    color: var(--text-muted);
  }

  .thoughts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .thought-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: border-color 0.2s;
  }

  .thought-card:hover {
    border-color: var(--accent);
  }

  .card-thumbnail {
    height: 120px;
    overflow: hidden;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-body {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.4;
    flex: 1;
  }

  .card-actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .card-actions form {
    display: inline;
  }

  .btn-sm {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
  }

  .card-content {
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.6;
    flex: 1;
  }

  .card-url {
    color: var(--accent);
    font-size: 0.8rem;
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  .card-url:hover {
    text-decoration: underline;
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .tag {
    background: rgba(99, 102, 241, 0.15);
    color: var(--accent);
    border-radius: 999px;
    padding: 0.1rem 0.5rem;
    font-size: 0.75rem;
  }

  .card-date {
    color: var(--text-muted);
    font-size: 0.75rem;
    margin-top: auto;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.5rem;
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }

  .modal-header h2 {
    font-size: 1.2rem;
  }

  .modal-close {
    background: transparent;
    color: var(--text-muted);
    border: none;
    font-size: 1.1rem;
    padding: 0.25rem;
    line-height: 1;
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

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.25rem;
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
