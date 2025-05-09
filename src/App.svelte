<script lang="ts">
  import ScenarioOverview from "lib/ScenarioOverview.svelte";
  import MentalModels from "lib/MentalModels.svelte";
  import ScenarioCodes from "lib/ScenarioCodes.svelte";
  import type { tSummaryData, tScenarioData } from "types";
  let selected_scenario: tScenarioData | undefined = $state(undefined);
</script>

<main class="w-[100vw] h-[100vh] max-h-[100vh] p-2 flex flex-col gap-x-2">
  <div
    class="font-bold italic text-[2.5rem] text-orange-900 bg-orange-50 pl-4 flex items-center uppercase"
  >
    Just Transitions
  </div>
  <div class="flex gap-x-2">
    <div class="flex flex-[2_2_0%] flex-col">
      <MentalModels></MentalModels>
    </div>
    <div class="flex flex-col flex-[2_2_0%] bg-slate-200">
      <ScenarioCodes {selected_scenario}></ScenarioCodes>
    </div>
    <div class="flex-1 flex flex-col">
      <ScenarioOverview bind:selected_scenario></ScenarioOverview>
    </div>
  </div>
</main>
