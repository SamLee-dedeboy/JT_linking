<script lang="ts">
  import { server_address } from "constants";
  import CodeTreeMap from "./CodeTreeMap.svelte";
  let { selected_scenario = undefined } = $props();

  function fetchScenarioCodes(scenario: string) {
    console.log({ scenario });
    return fetch(server_address + `/scenarios/codes_manual/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scenario }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Scenario Codes:", data);
        return data;
      })
      .catch((error) => {
        console.error("Error:", error);
        return error;
      });
  }
</script>

{#if selected_scenario}
  {#await fetchScenarioCodes(selected_scenario.number) then codes}
    <CodeTreeMap {codes}></CodeTreeMap>
  {:catch error}
    <p style="color: red">error {error.message}</p>
  {/await}
{/if}
