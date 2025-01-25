<script lang="ts">
  import { onMount } from "svelte";
  import { server_address } from "constants";
  import type { tScenarioConnection, tScenarioData, tSummaryData } from "types";
  import ScenarioCodes from "./ScenarioCodes.svelte";
  let {
    selected_code = undefined,
  }: { selected_code: tSummaryData | undefined } = $props();
  let scenario_overview: tScenarioData[] | undefined = $state(undefined);
  let selected_scenario: tScenarioData | undefined = $state(undefined);
  let connection_data: tScenarioConnection[] | undefined = $state(undefined);
  $effect(() => {
    if (selected_code) {
      fetchScenarioConnection(selected_code.code_name);
    }
  });
  let connection_explanations = $derived.by(() => {
    const connections =
      connection_data
        ?.filter((c) => c.scenario === selected_scenario?.name)
        .map((c) => c.connections)[0] || [];
    return connections.reduce((acc, c) => {
      acc[c.part_of_definition] = c.explanation;
      return acc;
    }, {});
  });
  let parts = $derived.by(() => {
    if (connection_explanations)
      return splitParagraphBySentences(
        selected_scenario?.narrative || "",
        Object.keys(connection_explanations),
      );
    else return [selected_scenario?.narrative || ""];
  });

  function fetchScenarioConnection(code: string) {
    console.log("Fetching Scenario Connection for Code:", code);
    fetch(server_address + `/scenarios/connection/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })
      .then((response) => response.json())
      .then((data) => {
        connection_data = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function fetchScenarioOverview() {
    fetch(server_address + "/scenarios/")
      .then((response) => response.json())
      .then((data) => {
        scenario_overview = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  function splitParagraphBySentences(
    paragraph: string,
    extractedSentences: string[],
  ) {
    // Sort the extracted sentences by their first occurrence in the paragraph
    extractedSentences.sort(
      (a, b) => paragraph.indexOf(a) - paragraph.indexOf(b),
    );

    let result: string[] = [];
    let currentIndex = 0;

    for (let sentence of extractedSentences) {
      const sentenceIndex = paragraph.indexOf(sentence, currentIndex);

      if (sentenceIndex === -1) {
        throw new Error(`Sentence "${sentence}" not found in paragraph.`);
      }

      // Capture text between the current index and the start of the found sentence
      if (currentIndex < sentenceIndex) {
        result.push(paragraph.substring(currentIndex, sentenceIndex));
      }

      // Add the extracted sentence
      result.push(sentence);

      // Update the current index to the end of the found sentence
      currentIndex = sentenceIndex + sentence.length;
    }

    // Capture any trailing text after the last sentence
    if (currentIndex < paragraph.length) {
      result.push(paragraph.substring(currentIndex));
    }
    console.log(result);
    return result;
  }
  onMount(() => {
    fetchScenarioOverview();
  });
</script>

{#if !scenario_overview}
  <div>Loading...</div>
{:else}
  <div class="scenario-container flex grow gap-y-2">
    <div class="flex flex-col flex-1">
      <div
        class="font-bold italic text-[3rem] text-gray-700 flex justify-center items-center"
      >
        Scenario Overview
      </div>
      <div class="flex">
        <div
          class="selector w-[14rem] min-h-[19rem] shrink-0 flex flex-col gap-y-4"
        >
          {#each scenario_overview as scenario}
            <button
              class="w-[13rem] italic outline outline-gray-300 outline-2 bg-gray-200 hover:bg-gray-300 hover:shadow-md text-gray-800 rounded px-1 py-0.5 font-sans uppercase transition-all"
              class:active={selected_scenario?.name === scenario.name}
              class:highlight={connection_data?.find(
                (c) => c.scenario === scenario.name,
              )}
              onclick={() =>
                (selected_scenario = scenario_overview?.find(
                  (s) => s.name === scenario.name,
                ))}
            >
              {scenario.name}
            </button>
          {/each}
        </div>
        <div class="grow px-2 flex flex-col divide-y">
          {#if selected_scenario}
            <div>
              {#each parts as part, part_index}
                {#if Object.keys(connection_explanations).includes(part)}
                  <span class="highlighted-sentence">
                    <span
                      class="sentence-clickable bg-yellow-400 hover:bg-yellow-500 px-0.5"
                    >
                      {part}</span
                    >
                    <span
                      class="sentence-tooltip pointer-events-none transition-opacity opacity-0 absolute w-[20rem] z-10 bg-orange-100 outline outline-2 outline-amber-500 rounded px-1 shadow-lg text-gray-800 font-serif"
                      >{connection_explanations[part]}</span
                    >
                  </span>
                {:else}
                  <span>{part}</span>
                {/if}
              {/each}
            </div>
            <div class="mt-2">
              Primary Research Importance - {selected_scenario.primary_research_importance}
            </div>
            <div>
              Adaptation - {selected_scenario.adaptation}
            </div>
            <div>
              Key Drivers - {selected_scenario.key_drivers}
            </div>
          {/if}
        </div>
      </div>
    </div>
    <div class="flex flex-col flex-1 bg-slate-300">
      <ScenarioCodes {selected_scenario}></ScenarioCodes>
    </div>
  </div>
{/if}

<style lang="postcss">
  .active {
    @apply bg-green-200 w-[14rem];
  }
  .highlight {
    @apply bg-yellow-200;
  }
  .highlighted-sentence:has(.sentence-clickable:active) .sentence-tooltip {
    @apply opacity-100;
  }
  .note-item:hover > .note-explanation {
    display: block;
  }
</style>
