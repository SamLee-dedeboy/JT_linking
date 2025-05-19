<script lang="ts">
  import { onMount } from "svelte";
  import { server_address } from "constants";
  import { MentalModelRenderer } from "renderers/MentalModelRenderer";
  const svgId = "mental_model_svg";
  let bubble_renderer: MentalModelRenderer = new MentalModelRenderer(
    svgId,
    () => {},
  );
  fetch(`${server_address}/mental_model/results/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Mental Models:", data);
      // Process the data as needed
      bubble_renderer.update(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  onMount(() => {
    bubble_renderer.init();
  });
</script>

<div class="flex flex-col grow">
  <div class="">Mental Models</div>
  <svg id={svgId} class="grow"></svg>
</div>
