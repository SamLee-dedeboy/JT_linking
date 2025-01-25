<script lang="ts">
  import { onMount } from "svelte";
  import { server_address, categories } from "./constants";
  import CategoryOverview from "lib/CategoryOverview.svelte";
  import WorkbookOverview from "lib/WorkbookOverview.svelte";
  import SummerDiscussion from "lib/SummerDiscussion.svelte";
  import ScenarioOverview from "lib/ScenarioOverview.svelte";
  import type { tSummaryData, tSummerDiscussionDataByCode } from "types";
  let keywords = $state({});
  let answers: tSummaryData[] | undefined = $state(undefined);
  let summer_discussion_data: tSummerDiscussionDataByCode | undefined =
    $state(undefined);

  let selected_code: tSummaryData | undefined = $state(undefined);

  let loading_answers = $state(false);
  let loading_notes = $state(false);

  async function fetchSummerNotes(question, codes) {
    console.log("Question:", question, "Codes:", codes);
    loading_notes = true;
    return;
    try {
      const response = await fetch(
        server_address + "/summer_discussion/question/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: question, codes: codes }),
        },
      );

      // summary_data = await response.json();
      summer_discussion_data = await response.json();
      console.log("Summer Discussion Notes:", summer_discussion_data);
      loading_notes = false;
      // If summaries are found, display them
    } catch (error) {
      console.error("Error:", error);
      loading_notes = false;
    }
  }

  onMount(() => {
    fetch(server_address + "/keywords/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Keywords:", data);
        keywords = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
</script>

<main class="w-[100vw] h-[100vh] max-h-[100vh] p-2 flex">
  <div class="flex-1 flex flex-col">
    <ScenarioOverview {selected_code}></ScenarioOverview>
    <!-- <CategoryOverview
      answer_updated={fetchSummerNotes}
      code_selected={(code) => (selected_code = code)}
      {loading_answers}
    ></CategoryOverview> -->
    <!-- <WorkbookOverview></WorkbookOverview> -->
  </div>
  <!-- <div class="flex-1">
    <SummerDiscussion
      {keywords}
      {summer_discussion_data}
      {selected_code}
      {loading_notes}
    ></SummerDiscussion>
  </div> -->
</main>
