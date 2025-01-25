<script lang="ts">
  let question = $state("");
  let { question_entered } = $props();
</script>

<div class="bg-gray-100 p-2 rounded flex gap-x-2 items-center">
  <img src="search.svg" alt="search" class="w-8 h-8" />
  <textarea
    id="question"
    bind:value={question}
    class="px-1 grow min-h-[2rem] max-h-[10rem] h-fit"
    placeholder="Enter your question here"
  ></textarea>
  <button
    onclick={() => question_entered(question)}
    class="shrink-0 p-2 bg-green-200 max-h-[2rem] rounded outline-gray-300 outline-1 outline hover:bg-green-300 hover:shadow-lg flex items-center"
  >
    <img src="arrow-right.svg" alt="search" />
  </button>
  <!-- {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}

  <div class="bg-gray-100 p-2 rounded max-h-[15vh] overflow-y-auto">
    {#if summaries.length > 0}
      <div id="summaries">
        {#each summaries as summary_obj}
          <div class="code_name">{summary_obj.code_name}</div>
          <div class="summary">{summary_obj.summary}</div>
        {/each}
      </div>
    {:else if !errorMessage}
      <p>No data available to display.</p>
    {/if}
  </div> -->
</div>

<style>
  .summary {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    padding: 10px;
    font-size: 1em;
    border-radius: 4px;
    white-space: pre-wrap;
  }

  .error {
    color: red;
    font-size: 1em;
    text-align: center;
  }
</style>
