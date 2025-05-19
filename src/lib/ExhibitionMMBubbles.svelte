<script lang="ts">
  import { onMount } from "svelte";
  import { ExhibitionMMRenderer } from "renderers/ExhibitionMMRenderer";
  let {
    svgId,
    nodes,
    loading = false,
    handleUpdateNodeCategory = () => {},
  }: {
    svgId: string;
    nodes: any[];
    loading: boolean;
    handleUpdateNodeCategory?: Function;
  } = $props();

  let bubble_renderer: ExhibitionMMRenderer = new ExhibitionMMRenderer(
    svgId,
    () => {},
  );
  $effect(() => {
    bubble_renderer.updateLoading(loading);
  });

  $effect(() => {
    bubble_renderer.update(nodes);
  });

  onMount(() => {
    bubble_renderer.init(handleUpdateNodeCategory);
    console.log("ExhibitionMMBubbles mounted", nodes);
    bubble_renderer.update(nodes);
  });
</script>

<svg id={svgId} class="grow outline-2 outline outline-gray-200"></svg>

<style lang="postcss">
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
</style>
