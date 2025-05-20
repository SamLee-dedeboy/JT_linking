<script lang="ts">
  import { slide } from "svelte/transition";
  type tCode = {
    name: string;
    parent: string;
    definition: string;
  };
  type tCodeEditorProps = {
    code_data: {
      code: string;
      parent: string;
    };
    codebook: tCode[];
    handleChangeCode: Function;
    handleDeleteCode: Function;
  };
  let {
    code_data,
    codebook,
    handleChangeCode,
    handleDeleteCode,
  }: tCodeEditorProps = $props();
  let showCodeSelection = $state(false);
  let codebook_grouped: Record<string, tCode[]> = $derived.by(() =>
    codebook.reduce((acc, code) => {
      if (code.parent === "N/A") return acc;
      if (!acc[code.parent]) {
        acc[code.parent] = [];
      }
      acc[code.parent].push(code);
      return acc;
    }, {}),
  );

  let filtered_codebook = $derived.by(() => {
    console.log("saerchQuery", searchQuery);
    return Object.entries(codebook_grouped).filter(([parent, children]) => {
      return (
        parent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        children.some((child) =>
          child.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      );
    });
  });
  let searchQuery = $state("");
</script>

<div class="container flex">
  <span
    role="button"
    class="container grow flex items-center px-1 py-1 hover:bg-slate-400 bg-slate-300 rounded"
    tabindex="0"
    onclick={() => (showCodeSelection = !showCodeSelection)}
    onkeyup={() => {}}
  >
    {#if code_data.parent !== "N/A"}
      {code_data.parent} /
    {/if}
    {code_data.code}
    <img
      src="src/assets/edit.svg"
      class="edit-icon w-4 h-4 ml-1 hidden"
      alt="Edit"
    />
  </span>
  <div
    role="button"
    tabindex="0"
    class="action hidden items-center cursor-pointer ml-auto bg-slate-300 shrink-0 outline outline-0 hover:outline-2 outline-red-500 rounded"
    onclick={() => handleDeleteCode(code_data)}
    onkeyup={() => {}}
  >
    <img src="src/assets/trash.svg" class="w-5 h-5 bg-slate-300" alt="Delete" />
  </div>
</div>
{#if showCodeSelection}
  <!-- search bar over here -->
  <div class="px-1">
    <input
      type="text"
      placeholder="Search codes..."
      bind:value={searchQuery}
      class="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
  </div>
  <div
    in:slide
    class="flex flex-col max-h-[15rem] overflow-auto riybded outline outline-1 outline-gray-400 shadow-md"
  >
    {#each filtered_codebook as [parent, children]}
      <span
        role="button"
        tabindex="0"
        class="bg-gray-300 px-1 hover:bg-gray-400"
        onclick={() => {
          handleChangeCode(parent, "N/A");
          showCodeSelection = false;
        }}
        onkeyup={() => {}}>{parent}</span
      >
      {#each children as child}
        <span
          role="button"
          tabindex="0"
          class="px-2 hover:!bg-gray-400"
          class:highlight={searchQuery !== "" &&
            child.name.toLowerCase().includes(searchQuery.toLowerCase())}
          onclick={() => {
            handleChangeCode(child.name, parent);
            showCodeSelection = false;
          }}
          onkeyup={() => {}}>{child.name}</span
        >
      {/each}
    {/each}
  </div>
{/if}

<style lang="postcss">
  .container:hover > .action {
    display: flex;
  }
  .container:hover > .edit-icon {
    display: block;
  }
  .highlight {
    background-color: #7ed957;
  }
</style>
