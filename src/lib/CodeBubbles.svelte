<script lang="ts">
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import type { tSummaryData } from "types";
  import { CodeBubbleRenderer } from "renderers/CodeBubbleRenderer";
  import { messageState } from "./messages.svelte";
  import { server_address } from "constants";
  import Tooltip from "./BubbleTooltip.svelte";
  import BubbleTooltip from "./BubbleTooltip.svelte";
  import { bubble_color, setOpacity } from "constants/colors";
  type tCode = {
    name: string;
    participants: string[];
    scenario_children: string[];
  };
  type CodeBubbleProps = {
    codes: tCode[];
  };
  const svgId = "code_tree_map";
  let bubble_renderer: CodeBubbleRenderer = new CodeBubbleRenderer(
    svgId,
    handleClick,
  );
  let { codes }: CodeBubbleProps = $props();
  type tBubble = {
    id: string;
    data: tCode;
    x: number;
    y: number;
  };
  let bubbles_coords: tBubble[] = [];
  let selected_bubble: tBubble | undefined = $state(undefined);
  let tooltip: any = $state();
  let bubbles: tBubble[] = [];
  let init_done = false;
  const categories = ["Drivers", "Strategies", "Value", "Governance"];

  // effect when codes change
  $effect(() => {
    if (!init_done) {
      bubble_renderer.init();
      init_done = true;
    }
    const _code_dict = codes.reduce((acc, code) => {
      acc[code.name] = code;
      return acc;
    }, {});
    bubbles = _code_dict["root"].scenario_children.map((name) => {
      const x = Math.random() * 500 + 200;
      const y = Math.random() * 500;
      return {
        id: name,
        data: _code_dict[name],
        parent_x: x,
        parent_y: y,
        x: x,
        y: y,
      };
    });
    updateBubbles(bubbles);
  });

  function updateBubbles(_bubbles: tBubble[]) {
    console.log("update bubbles", { _bubbles });
    bubble_renderer.update(bubbles, (bubble_data) => {
      bubbles_coords = bubble_data;
    });
  }

  function handleClick(bubble) {
    selected_bubble = bubble;
    bubble_renderer.highlightSelectBubble(bubble);

    tooltip.style.display = "block";
    tooltip.style.left = `${bubble.x + bubble.r + 5}px`;
    tooltip.style.top = `${bubble.y - bubble.r}px`;
    console.log("Bubble clicked", bubble, tooltip);
  }

  function handleExpand(bubble) {
    if (bubble.data.scenario_children.length === 0) {
      return;
    }
    const _code_dict = codes.reduce((acc, code) => {
      acc[code.name] = code;
      return acc;
    }, {});
    const bubble_children = bubble.data.scenario_children.map((name) => {
      return {
        id: name,
        data: _code_dict[name],
        parent_x: bubble.x,
        parent_y: bubble.y,
        x: bubble.x,
        y: bubble.y,
      };
    });
    bubbles = bubbles.concat(bubble_children);
    bubbles = bubbles.filter((b) => b.id !== bubble.id);
    updateBubbles(bubbles);
  }

  /**
   * retrieve information on the bubble (code)
   * @param bubble
   */
  function handleAsk(bubble) {
    console.log({ code: bubble.data });
    fetch(`${server_address}/codes/ask/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: bubble.data,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        messageState.addMessage({
          source: "assistant",
          content:
            `What do you want to know about ${bubble.id}?` +
            "\n" +
            data["response"],
          render_content: `What do you want to know about ${bubble.id}?`,
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    // messageState.addMessage({
    //   source: "assistant",
    //   content: `What do you want to know about ${bubble.id}?`,
    // });
  }
</script>

<div class="flex grow relative">
  <div
    bind:this={tooltip}
    class="tooltip absolute hidden bg-gray-100 outline-2 outline-gray-400 outline rounded p-2 z-10 w-[25rem] text-sm font-mono"
  >
    {#if selected_bubble}
      <BubbleTooltip bubble={selected_bubble}></BubbleTooltip>
    {/if}
  </div>
  <svg id={svgId} class="w-full h-full"></svg>
  <div
    class="legend absolute right-2 top-1 flex flex-col justify-center gap-y-2"
  >
    {#each categories as category}
      <div class="flex items-center gap-x-2 text-sm font-mono">
        <svg class="w-6 h-6" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="5" fill={bubble_color(category)} />
        </svg>
        <span>{category}</span>
      </div>
    {/each}
    <!-- <button
      class="outline-orange-300 bg-orange-100 hover:bg-orange-300 px-2 ml-1"
      onclick={() => {
        if (selected_bubble) {
          handleExpand(selected_bubble);
        }
      }}>Expand</button
    >
    <button
      class="outline-blue-300 bg-sky-100 hover:bg-blue-300 px-2 ml-1"
      onclick={() => {
        handleAsk(selected_bubble);
      }}
    >
      Ask</button
    > -->
    <!-- <button
      class="outline-gray-300 bg-gray-50 hover:bg-gray-300"
      onclick={() => {
        selected_bubble = undefined;
        bubble_renderer.highlightSelectBubble(undefined);
      }}
    >
      Clear Selection</button
    > -->
  </div>
</div>

<style lang="postcss">
  button {
    @apply max-w-[6rem] text-slate-700 font-mono outline outline-2 rounded px-2 py-1 flex flex-wrap gap-x-1 items-center justify-center hover:scale-110 transition-all duration-100;
  }

  :global(.bubble.hovered) {
    stroke: black;
    stroke-width: 2px;
  }
  :global(.bubble.selected) {
    stroke: black;
    stroke-width: 2px;
  }
  :global(.bubble.mousedown) {
    stroke: black;
    stroke-width: 2px;
    filter: brightness(80%);
  }
</style>
