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
  :global(.is_center) {
    fill: oklch(95.6% 0.045 203.388);
    stroke: oklch(82.8% 0.111 230.318);
    stroke-width: 2px;
  }
  :global(.loading) {
    animation: pulse 2s infinite ease-in-out;
    transform-origin: center;
  }
  :global(.is_top) {
    @apply border-lime-300;
    fill: oklch(93.8% 0.127 124.321);
    stroke: oklch(84.1% 0.238 128.85);
    & .code {
      @apply bg-slate-200;
    }
  }
  :global(.is_bottom) {
    @apply border-yellow-400;
    fill: oklch(94.5% 0.129 101.54);
    stroke: oklch(85.2% 0.199 91.936);
    & .code {
      @apply bg-yellow-50;
    }
  }

  .pulse {
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }

  .loading-canvas {
    position: relative;
    background: linear-gradient(
      90deg,
      #c2e2fd 20%,
      #87f2f7 40%,
      #86c6ff 60%,
      transparent 80%
    );
    background-size: 200% 200%;
    animation: dash 3s linear infinite;
  }
  @keyframes dash {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 200% 150%;
    }
  }
</style>
