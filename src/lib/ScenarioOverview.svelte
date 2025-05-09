<script lang="ts">
  import { onMount } from "svelte";
  import { server_address } from "constants";
  import { slide } from "svelte/transition";
  import type { tScenarioData } from "types";
  let {
    selected_scenario = $bindable(),
  }: {
    selected_scenario: tScenarioData | undefined;
  } = $props();
  let scenario_overview: tScenarioData[] | undefined = $state(undefined);

  function fetchScenarioOverview() {
    fetch(server_address + "/scenarios/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Scenario Overview:", data);
        scenario_overview = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  onMount(() => {
    fetchScenarioOverview();
  });
</script>

{#if !scenario_overview}
  <div>Loading...</div>
{:else}
  <div class="scenario-container flex grow gap-y-2">
    <div class="flex flex-col flex-1 gap-y-2">
      <div class="flex flex-col py-1 grow gap-y-2">
        <div class="selector flex flex-col gap-y-4 z-10">
          <div class="text-gray-600 italic">Scenarios:</div>
          <div class="flex gap-x-4 gap-y-2 flex-wrap mx-1">
            {#each scenario_overview as scenario}
              <button
                class="w-fit min-h-[4rem] text-sm italic outline outline-gray-200 outline-2 bg-gray-100 hover:bg-gray-300 hover:shadow-md text-gray-800 rounded px-2 py-0.5 font-sans uppercase transition-all"
                class:active={selected_scenario?.name === scenario.name}
                onclick={() =>
                  (selected_scenario = scenario_overview?.find(
                    (s) => s.name === scenario.name,
                  ))}
              >
                {scenario.name}
              </button>
            {/each}
          </div>
        </div>
        <div class="overflow-y-auto bg-[#fffdf6] grow">
          <div class="px-2 flex flex-col divide-y rounded text-slate-800">
            {#if selected_scenario}
              {#key selected_scenario.name}
                <div in:slide class=" p-1 rounded">
                  <span class="italic text-gray-500 text-sm">
                    Description -
                  </span>
                  <span>
                    {selected_scenario.narrative}
                  </span>
                </div>
                <div class="mt-2 px-1 rounded">
                  <span class="italic text-gray-500 text-sm">
                    Primary Research Importance
                  </span>
                  <div>
                    {selected_scenario.primary_research_importance}
                  </div>
                </div>
                <div class="mt-2 px-1 rounded">
                  <span class="italic text-gray-500 text-sm"> Adaptation </span>
                  <div>
                    {selected_scenario.adaptation}
                  </div>
                </div>
                <div class="mt-2 px-1 rounded">
                  <span class="italic text-gray-500 text-sm">
                    Key Drivers
                  </span>
                  <div>
                    {selected_scenario.key_drivers}
                  </div>
                </div>
              {/key}
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="postcss">
  .active {
    @apply bg-[#fffdf6] outline-orange-800 font-semibold text-orange-900;
  }
</style>
