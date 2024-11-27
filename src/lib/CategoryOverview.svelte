<script lang="ts">
  import { server_address, categories } from "constants";
  import { onMount } from "svelte";
  import SearchInput from "lib/SearchInput.svelte";
  let questions_data: any[] | undefined = $state(undefined);
  let answers: { code_name: string; summary: string }[] | undefined =
    $state(undefined);
  $inspect(answers);
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

<div
  class="overview-container flex flex-col gap-y-2 relative overflow-auto p-2"
>
  <div
    class="font-bold italic text-[3rem] text-gray-700 flex justify-center items-center"
  >
    Category Overview
  </div>
  <div class="flex gap-x-3">
    <div class="flex-1 flex-col gap-y-2">
      <div class="shadow-[0px_0px_1px_1px_#a3a3a3] rounded">
        <SearchInput searchDone={(d) => (answers = d)}></SearchInput>
      </div>
      <span class="italic"> Example Questions: </span>
      {#if questions_data}
        <div class="flex flex-col gap-y-4 italic">
          <div class="flex flex-1 gap-x-3">
            <div
              class="questions flex-1 justify-center flex flex-col divide-y divide-black"
            >
              {#each questions_data as question_obj}
                <button
                  class="flex flex-col hover:bg-gray-300 px-1 italic gap-x-2 py-1"
                  onclick={() => {
                    console.log("Clicked", question_obj);
                    answers = question_obj.summaries;
                  }}
                >
                  <div class="w-[4.5rem] flex shrink-0">
                    <span
                      class="outline outline-0 text-gray-500 outline-gray-400 rounded text-xs h-fit w-fit"
                      >{question_obj.category}</span
                    >
                  </div>
                  <div class="text-left text-gray-700">
                    {question_obj.question}
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
    <!-- answers -->
    <div class="bg-white flex-1 px-1">
      {#if answers}
        {#each answers as answer}
          <div class="p-2 rounded">
            <div class="code_name">{answer.code_name}</div>
            <div class="summary">{answer.summary}</div>
          </div>
        {/each}
      {:else}
        <p>No data available to display.</p>
      {/if}
    </div>
  </div>
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
