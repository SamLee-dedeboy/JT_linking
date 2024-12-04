<script lang="ts">
  import { onMount } from "svelte";
  import { server_address } from "constants";

  let { keywords }: { keywords: Record<string, string> } = $props();
  let summer_discussion_data: any[] | undefined = $state(undefined);
  let hide_full: boolean[] = $state([]);
  function fetchSummerDiscussion() {
    fetch(server_address + "/summer_discussion/overview/")
      .then((response) => response.json())
      .then((data) => {
        console.log("Summer Discussion Data:", data);
        summer_discussion_data = data;
        hide_full = summer_discussion_data?.map(() => true) || [];
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function truncate_if_flag(arr, flag, max_length = 3) {
    if (flag) {
      return arr.slice(0, Math.min(arr.length, max_length));
    } else {
      return arr;
    }
  }

  onMount(() => {
    fetchSummerDiscussion();
  });
</script>

<div class="flex flex-col px-2">
  <div
    class="font-bold italic text-[3rem] text-gray-700 flex justify-center items-center"
  >
    Summer Institute Discussion Notes
  </div>
  {#if summer_discussion_data}
    {#each summer_discussion_data as discussion_obj, topic_index}
      {@const truncated_subtopics = truncate_if_flag(
        discussion_obj.children,
        hide_full[topic_index],
      )}
      <div class="root-topic p-2">
        <div
          class="root-header font-semibold italic text-[1.5rem] text-gray-600"
        >
          {discussion_obj.name}
        </div>
        <div
          class="flex flex-col gap-y-1 flex-wrap outline outline-2 outline-gray-500 rounded p-1 shadow-lg"
        >
          {#each truncated_subtopics as subtopic, subtopic_index}
            {@const regex = new RegExp(
              `\\b(${Array.from(Object.keys(keywords)).join("|")})\\b`,
              "gi",
            )}
            {@const parts = subtopic.name.split(regex).filter(Boolean)}
            <div>
              <span>
                {subtopic_index + 1}.
              </span>
              {#each parts as part, part_index}
                {#if part.match(regex)}
                  <span class="highlighted-keyword px-0.5 w-fit relative">
                    <span
                      class="keyword-clickable bg-yellow-400 hover:bg-yellow-500 px-0.5"
                    >
                      {part}</span
                    >
                    <span
                      class="keyword-tooltip transition-opacity opacity-0 absolute w-[20rem] z-10 bg-orange-100 outline outline-2 outline-amber-500 rounded px-1 shadow-lg text-gray-800 font-serif"
                      >{keywords[part]}</span
                    >
                  </span>
                {:else}
                  <span>{part}</span>
                {/if}
              {/each}
            </div>
          {/each}
          {#if truncated_subtopics.length < discussion_obj.children.length}
            <div
              tabindex="0"
              role="button"
              class="cursor-pointer hover:bg-gray-400 px-1 w-fit transition-colors"
              onclick={() => (hide_full[topic_index] = !hide_full[topic_index])}
              onkeyup={() => {}}
            >
              ...
            </div>
          {/if}
          {#if !hide_full[topic_index]}
            <div
              tabindex="0"
              role="button"
              class="cursor-pointer hover:bg-gray-400 px-1 w-fit transition-colors outline outline-2 italic text-sm outline-gray-500 rounded"
              onclick={() => (hide_full[topic_index] = !hide_full[topic_index])}
              onkeyup={() => {}}
            >
              Show Less
            </div>
          {/if}
        </div>
        <div></div>
      </div>
    {/each}
  {/if}
</div>

<style lang="postcss">
  .highlighted-keyword:has(.keyword-clickable:active) .keyword-tooltip {
    @apply opacity-100;
  }
</style>
