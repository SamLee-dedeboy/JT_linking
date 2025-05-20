<script lang="ts">
  import { server_address } from "constants";
  import { onMount } from "svelte";
  import ExhibitionMmBubbles from "./ExhibitionMMBubbles.svelte";

  let mental_models: any[] = $state([]);
  function fetchMMs() {
    fetch(`${server_address}/mental_model/exhibition/`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        mental_models = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  onMount(() => {
    fetchMMs();
  });
</script>

<div class="flex grow overflow-y-auto relative">
  <div
    class="absolute top-1 left-0 right-0 flex flex-wrap justify-around gap-2"
  >
    {#each mental_models as mental_model, index}
      <div class="flex w-[28rem] h-[40rem]">
        <ExhibitionMmBubbles
          svgId={`mental_model_svg_${index}`}
          nodes={mental_model}
          loading={false}
          handleUpdateNodeCategory={() => {}}
        />
      </div>
    {/each}
  </div>
</div>

<style lang="postcss">
</style>
