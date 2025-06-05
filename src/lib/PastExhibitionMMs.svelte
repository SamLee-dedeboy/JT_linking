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

{#each mental_models as mental_model, index}
  <div class="flex w-[20rem] h-[26rem]">
    <ExhibitionMmBubbles
      svgId={`mental_model_svg_${index}`}
      nodes={mental_model}
      loading={false}
      stateless={false}
      handleUpdateNodeCategory={() => {}}
    />
  </div>
{/each}

<style lang="postcss">
</style>
