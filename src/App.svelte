<script lang="ts">
  import ScenarioOverview from "lib/ScenarioOverview.svelte";
  import MentalModels from "lib/MentalModels.svelte";
  import ScenarioCodes from "lib/ScenarioCodes.svelte";
  import CaptureExhibitionMMs from "lib/CaptureExhibitionMMs.svelte";
  import PastExhibitionMMs from "lib/PastExhibitionMMs.svelte";
  import type { tSummaryData, tScenarioData } from "types";
  let selected_scenario: tScenarioData | undefined = $state(undefined);
  let mode = $state("capture"); // "MM" or "capture"
  let show_past_MM = $state(true);
</script>

<main class="w-[100vw] h-[100vh] p-2 flex flex-col gap-x-2 bg-[#253439]">
  <div
    tabindex="0"
    role="button"
    class="jt-section-title text-[2.5rem] text-[#253439] bg-[#7ed957] pl-4 flex items-center uppercase"
    onclick={() => (mode = mode == "MM" ? "capture" : "MM")}
    onkeyup={() => {}}
  >
    Just Transitions
  </div>
  <div class="flex gap-8 grow">
    {#if mode == "MM"}
      <div class="flex justify-between gap-8 grow">
        <div class="flex flex-col w-[45%]">
          <div class="jt-section-title text-center text-[1.5rem] text-white">
            Interview Mental Models
          </div>
          <MentalModels></MentalModels>
        </div>
        <div class="flex flex-col grow">
          <div class="jt-section-title text-center text-[1.5rem] text-white">
            Exhibition Mental Models
          </div>
          <div
            class="flex flex-wrap grow justify-between gap-4 h-1 overflow-y-auto pr-3"
          >
            <PastExhibitionMMs></PastExhibitionMMs>
          </div>
        </div>
      </div>
    {:else}
      <div class="flex flex-1 grow">
        <CaptureExhibitionMMs></CaptureExhibitionMMs>
      </div>
      <!-- <div class="flex flex-col flex-[2_2_0%] bg-slate-200">
        <ScenarioCodes {selected_scenario}></ScenarioCodes>
      </div>
      <div class="flex-1 flex flex-col">
        <ScenarioOverview bind:selected_scenario></ScenarioOverview>
      </div> -->
    {/if}
  </div>
</main>
