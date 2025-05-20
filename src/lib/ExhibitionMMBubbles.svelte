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

<svg id={svgId} class="grow outline-2 outline-dotted outline-[#7ed957]"></svg>

<style lang="postcss">
  :global(.loading) {
    animation: pulse 2s infinite ease-in-out;
    transform-origin: center;
  }
  :global(.is_top) {
    fill: #a2bffd;
    stroke: #a2bffd;
  }
  :global(.is_bottom) {
    fill: oklch(52% 0.105 223.128);
    stroke: oklch(52% 0.105 223.128);
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
