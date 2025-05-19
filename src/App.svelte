<script lang="ts">
  import ScenarioOverview from "lib/ScenarioOverview.svelte";
  import MentalModels from "lib/MentalModels.svelte";
  import ScenarioCodes from "lib/ScenarioCodes.svelte";
  import CaptureExhibitionMMs from "lib/CaptureExhibitionMMs.svelte";
  import PastExhibitionMMs from "lib/PastExhibitionMMs.svelte";
  import type { tSummaryData, tScenarioData } from "types";
  let selected_scenario: tScenarioData | undefined = $state(undefined);
  let mode = $state("MM"); // "MM" or "Scenario"
  let show_past_MM = $state(true);
</script>

<main class="w-[100vw] h-[100vh] p-2 flex flex-col gap-x-2">
  <div
    class="font-bold italic text-[2.5rem] text-orange-900 bg-orange-50 pl-4 flex items-center uppercase"
  >
    Just Transitions
  </div>
  <div class="flex gap-8 grow">
    {#if mode == "MM"}
      <div class="flex flex-1 flex-col">
        {#if show_past_MM}
          <div class="flex flex-col gap-2 grow">
            <div class="text-lg font-bold">Past Mental Models</div>
            <PastExhibitionMMs></PastExhibitionMMs>
          </div>
        {:else}
          <MentalModels></MentalModels>
        {/if}
      </div>
      <div class="flex flex-1">
        <CaptureExhibitionMMs></CaptureExhibitionMMs>
      </div>
    {:else}
      <div class="flex flex-col flex-[2_2_0%] bg-slate-200">
        <ScenarioCodes {selected_scenario}></ScenarioCodes>
      </div>
      <div class="flex-1 flex flex-col">
        <ScenarioOverview bind:selected_scenario></ScenarioOverview>
      </div>
    {/if}
  </div>
</main>
