<script lang="ts">
  import { server_address } from "constants";

  let selectedScenario: string = "";
  let selectedCategory: string = "";
  let results: Array<{ value1: string; value2: string }> = [];
  let errorMessage: string = "";

  // Fetch data function
  async function fetchData() {
    if (!selectedScenario || !selectedCategory) {
      errorMessage = "Please select both a scenario and a category.";
      return;
    }

    try {
      const response = await fetch(server_address + "/codes/content/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedScenario, selectedCategory }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from the server.");
      }

      const data = await response.json();
      results = data.results || [];
      errorMessage = results.length === 0 ? "No results found." : "";
    } catch (error) {
      console.error(error);
      errorMessage = "An error occurred while fetching data.";
    }
  }
</script>

<div class="flex flex-col gap-y-2">
  <div
    class="font-bold italic text-[3rem] text-gray-700 flex justify-center items-center"
  >
    Workbook Results
  </div>
  <div class="flex gap-x-4">
    <select bind:value={selectedScenario} class="capitalize">
      <option value="" disabled selected>Select Scenario</option>
      <option value="BUSINESS AS USUAL">Business as usual</option>
      <option value="ECO MACHINE">Eco machine</option>
      <option value="CALLING ON RESERVES">Calling on reserves</option>
      <option value="TUNNEL VISION">Tunnel vision</option>
      <option value="NEW GREEN WATERSHED">New green watershed</option>
      <option value="BOLSTER & FORTIFY">Bolster & fortify</option>
    </select>
    <select bind:value={selectedCategory}>
      <option value="" disabled selected>Select Category</option>
      <option value="BENEFITS MAJORS">Benefits-major</option>
      <option value="BENEFITS NEUTRAL">Benefits-neutral</option>
      <option value="BENEFITS MINOR">Benefits-minor</option>
      <option value="NEUTRAL MAJOR">Neutral-major</option>
      <option value="NEUTRAL NEUTRAL">Neutral-neutral</option>
      <option value="NEUTRAL MINOR">Neutral-minor</option>
      <option value="IMPACTS MAJORS">Impacts-majors</option>
      <option value="IMPACTS NEUTRAL">Impacts-neutral</option>
      <option value="IMPACTS MINOR">Impacts-minor</option>
    </select>
    <button
      class="outline outline-1 outline-gray-500 rounded hover:bg-gray-300"
      on:click={fetchData}>Search</button
    >
  </div>
  {#if errorMessage}
    <div class="error">{errorMessage}</div>
  {/if}
</div>

{#if results.length > 0}
  <div class="results">
    <h3>Results</h3>
    <div class="divide-y flex flex-col">
      {#each results as { value1, value2 }}
        <div class="flex flex-col">
          <div class="italic text-gray-500">{value2}</div>
          <div>{value1}</div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .flex {
    display: flex;
  }
  .flex-col {
    flex-direction: column;
  }
  .gap-y-2 > * + * {
    margin-top: 8px;
  }
  .gap-x-4 > * + * {
    margin-left: 16px;
  }
  select,
  button {
    padding: 5px;
    font-size: 1em;
  }
  .results {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #ccc;
    background: #f9f9f9;
  }
  .error {
    color: red;
    font-weight: bold;
    margin-top: 10px;
  }
</style>
