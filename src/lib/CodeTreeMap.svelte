<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import type { tSummaryData } from "types";
  import { CodeTreeMapRenderer } from "renderers/CodeTreeMapRenderer";
  type CodeTreeMapProps = {
    codes: tSummaryData[];
  };
  const svgId = "code_tree_map";
  let treemap_renderer: CodeTreeMapRenderer = new CodeTreeMapRenderer(svgId);
  let { codes }: CodeTreeMapProps = $props();
  let init_done = false;

  $effect(() => {
    console.log("Updating treemap with codes:", codes);
    if (!init_done) {
      treemap_renderer.init();
      init_done = true;
    }
    const root = d3.stratify().path((d) => d.code_name.replaceAll("\\", "/"))(
      codes,
    );
    treemap_renderer.update(root);
  });
</script>

<div class="flex grow">
  <svg id={svgId} class="w-full h-full"></svg>
</div>
