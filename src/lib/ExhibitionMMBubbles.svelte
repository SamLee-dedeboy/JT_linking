<script lang="ts">
  import { onMount } from "svelte";
  import { ExhibitionMMRenderer } from "renderers/ExhibitionMMRenderer";
  let {
    svgId,
    nodes,
    // links = undefined,
    loading = false,
    stateless = true,
    handleUpdateNodeCategory = () => {},
    handleClickNode = () => {},
  }: {
    svgId: string;
    nodes?: { node: string; classification: string }[];
    // links?: [string, string][];
    stateless?: boolean;
    loading: boolean;
    handleClickNode?: Function;
    handleUpdateNodeCategory?: Function;
  } = $props();

  let bubble_renderer: ExhibitionMMRenderer = new ExhibitionMMRenderer(
    handleClickNode,
    handleUpdateNodeCategory,
  );

  let init_done = false;

  $effect(() => {
    bubble_renderer.updateLoading(loading);
  });

  $effect(() => {
    if (!stateless && nodes && init_done) {
      console.log("ExhibitionMMBubbles nodes updated stateless", nodes);
      bubble_renderer.update_node_classification(nodes);
      bubble_renderer.update(nodes);
    }
  });
  export function update_node_classification(
    nodes: { node: string; classification: string }[],
  ) {
    console.log("ExhibitionMMBubbles update_node_classification called", nodes);
    bubble_renderer.update_node_classification(nodes);
  }
  export function update(nodes: any[], links = undefined) {
    console.log("ExhibitionMMBubbles update called", nodes);
    bubble_renderer.update(nodes, links);
  }

  onMount(() => {
    bubble_renderer.init(svgId);
    init_done = true;
    if (!stateless && nodes) {
      bubble_renderer.update_node_classification(nodes);
      bubble_renderer.update(nodes);
    }
    // console.log("ExhibitionMMBubbles mounted", nodes);
    // bubble_renderer.update(nodes, links);
  });
</script>

<svg id={svgId} class="grow outline-0 outline-dotted outline-[#7ed957]"></svg>

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
