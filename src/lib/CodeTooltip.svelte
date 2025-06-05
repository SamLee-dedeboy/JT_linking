<script lang="ts">
  import { onMount } from "svelte";
  type tCodeTooltipProps = {
    codebook: {
      parent: string;
      name: string;
      definition: string;
      type: string;
    }[];
    all_code_participants: Record<string, string[]>;
    selected_code: string | undefined;
    handleClose?: () => void;
  };
  let {
    codebook,
    all_code_participants,
    selected_code,
    handleClose,
  }: tCodeTooltipProps = $props();
  let child_dict = $derived(
    codebook.reduce((acc, code) => {
      const parent_code = code.parent === "N/A" ? code.name : code.parent;
      acc[parent_code] = acc[parent_code] || [];
      acc[parent_code].push(code.name);
      return acc;
    }, {}),
  );
  let parent_codes = $derived(
    codebook.filter((code) => code.parent === "N/A").map((code) => code.name),
  );
  let parent_to_child_participants = $derived(
    parent_codes.reduce((acc, parent) => {
      acc[parent] = child_dict[parent]
        .map((name) => {
          return {
            [name]: all_code_participants[name] || [],
          };
        })
        .filter((item) => (Object.values(item) as any)[0].length > 0);
      return acc;
    }, {}),
  );

  let tooltip_data = $derived(
    selected_code ? parent_to_child_participants[selected_code] : undefined,
  );
  let total_participants = $derived(
    tooltip_data
      ? tooltip_data.reduce((acc, item) => {
          (Object.values(item) as any)[0].forEach((participant) =>
            acc.add(participant),
          );
          return acc;
        }, new Set()).size
      : 0,
  );
  onMount(() => {
    console.log("Parent to Child Participants:", parent_to_child_participants);
    console.log("Tooltip Data:", tooltip_data);
  });
</script>

<div class="">
  {#if tooltip_data}
    <div
      class="tooltip-content text-lg px-3 py-1 jt-body-2 outline outline-4 outline-slate-200 rounded shadow-md bg-[#253439] text-white"
    >
      <div>
        <span
          class="text-[#253439] italic font-semibold px-1 py-1 rounded bg-[#7ed957]"
        >
          {selected_code}
        </span>
        is defined as:
        <p
          class="mt-1 text-[1rem] border-l-[6px] border-[#7ed957] bg-[#323b3e] pl-2 py-0.5 rounded"
        >
          {codebook.find((code) => code.name === selected_code)?.definition ||
            "No definition available"}
        </p>
      </div>
      <p>
        <span class=" font-semibold underline">
          {total_participants}
        </span>
        participants mentioned this in the interview.
      </p>
      {#if tooltip_data.length > 1}
        <p class="">
          Among these {total_participants} participants,
        </p>
        <ul class="">
          <li class="ml-2">
            -
            <span class="underline">
              {(Object.values(tooltip_data[0]) as any)[0].length}
            </span>
            participants mentioned
            <span class="underline italic">
              {Object.keys(tooltip_data[0])[0]}
              (general)
            </span>
          </li>
          {#each tooltip_data
            .slice(1)
            .sort((a, b) => (Object.values(b) as any)[0].length - (Object.values(a) as any)[0].length) as item, index}
            <li class="ml-2">
              -
              <span class="underline">
                {(Object.values(item) as any)[0].length}
              </span>
              participants mentioned
              <span class="underline italic">
                {Object.keys(item)[0]}
              </span>
            </li>
          {/each}
        </ul>
      {/if}
      <button
        class="mt-1 px-1 py-0.5 rounded hover:bg-[#7ed957] hover:text-[#253439] hover:outline-[#253439] outline outline-2 outline-slate-200 transition-colors duration-200"
        onclick={handleClose}>Close</button
      >
    </div>
  {:else}
    <div class="tooltip-content text-slate-700 text-lg">
      Select a code to see details.
    </div>
  {/if}
</div>
