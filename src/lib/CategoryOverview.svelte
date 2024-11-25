<script lang="ts">
  import { server_address, categories } from "constants";
  import { onMount } from "svelte";
  let questions_data: Record<string, any[]> | undefined = undefined;
  let selected_category = categories[0];
  async function fetchOverview() {
    try {
      const response = await fetch(server_address + "/codes/overview/");
      const overview_data = await response.json();
      questions_data = overview_data.questions;
      console.log("overview data", { overview_data });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Function to handle the POST request
  onMount(() => {
    fetchOverview();
  });
</script>

<div class="overview-container flex flex-col gap-y-2">
  <div class="flex absolute left-0 top-0 gap-x-4 p-1">
    {#each categories as category}
      <button
        class="px-1 py-0.5 outline outline-2 outline-gray-400 rounded italic bg-gray-100 hover:bg-gray-300"
        class:active={selected_category === category}
        on:click={() => (selected_category = category)}
      >
        {category}
      </button>
    {/each}
  </div>
  <div
    class="font-bold italic text-[3rem] text-gray-700 flex justify-center items-center"
  >
    Category Overview
  </div>
  {#if questions_data}
    <div class="flex flex-col gap-y-4">
      <div class="flex flex-1 gap-x-3">
        <div
          class="category flex-1 transition-all min-h-[8rem] overflow-auto cursor-pointer flex justify-center items-center outline outline-2 outline-gray-400 rounded shadow-md"
          tabindex="-1"
        >
          <span
            class="font-semibold pointer-events-none italic text-[2rem] text-gray-600"
            >{selected_category}</span
          >
        </div>
        <div
          class="questions flex-1 justify-center flex flex-col divide-y divide-black"
        >
          {#each questions_data[selected_category] as { questions, summaries }}
            <div class="flex flex-col">
              {#each questions as question}
                <p>{question}</p>
              {/each}
            </div>
            <div class="answers flex-1 justify-center flex flex-col pl-4">
              {#each summaries as summary}
                <p>{summary.code_name.replace(`${selected_category}\\`, "")}</p>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <p>No data available to display.</p>
  {/if}
</div>

<style lang="postcss">
  .active {
    @apply bg-green-200 shadow-md outline-green-500;
  }
  .questions {
    /* opacity: 0; */
    transition-property: display opacity;
    transition-duration: 1s;
    transition-behavior: allow-discrete;
  }
  .category:focus + div {
    @apply opacity-100;
    @starting-style {
      opacity: 0;
    }
  }
  .category:blur + div {
    @apply opacity-0;
  }
</style>
