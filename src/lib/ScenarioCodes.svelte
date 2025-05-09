<script lang="ts">
  import { server_address } from "constants";
  import CodeTreeMap from "./CodeTreeMap.svelte";
  import CodeBubbles from "./CodeBubbles.svelte";
  import EquitySpace from "./EquitySpace.svelte";
  import type { tScenarioData } from "types";
  let { selected_scenario = undefined } = $props();

  function fetchScenarioCodes(scenario: tScenarioData) {
    console.log(
      "Fetching Scenario Codes for Scenario:",
      scenario.number,
      scenario.name,
    );
    return fetch(server_address + `/scenarios/codes_manual/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scenario: scenario.number }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Scenario Codes:", data);
        // return data["occurrences"];
        return data["participants"];
      })
      .catch((error) => {
        console.error("Error:", error);
        return error;
      });
  }
</script>

{#if selected_scenario}
  {#key selected_scenario}
    <div
      class="font-bold italic text-slate-700 justify-center items-center flex flex-col"
    >
      <span class="bg-gray-100 w-full text-center text-[2.5rem]">
        Public Opinion
      </span>
      <div class="px-1 font-mono text-[1rem] font-normal w-full flex flex-col">
        <span class="inline-flex flex-wrap items-center">
          <img src="info.svg" class="w-5 h-5 inline mr-2" alt="info" />
          This chart shows the distribution of participants' responses in our interview.
        </span>
        <span class="">
          Each bubble is a category. Bigger bubbles indicate
          <span class="font-semibold whitespace-normal">
            &nbsp;more participants mentioned this category.
          </span>
        </span>
        <span>
          Click any bubble and use the buttons on the left to interact with it.
        </span>
      </div>
    </div>
    {#await fetchScenarioCodes(selected_scenario) then codes}
      <CodeBubbles {codes}></CodeBubbles>
      <!-- <CodeTreeMap {codes}></CodeTreeMap> -->
      <!-- <EquitySpace></EquitySpace> -->
    {:catch error}
      <p style="color: red">error {error.message}</p>
    {/await}
  {/key}
{/if}

<style lang="postcss">
</style>
