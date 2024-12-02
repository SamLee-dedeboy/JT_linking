<script lang="ts">
  import { onMount } from "svelte";
  import { server_address, categories } from "./constants";
  import CategoryOverview from "lib/CategoryOverview.svelte";
  import WorkbookOverview from "lib/WorkbookOverview.svelte";
</script>

<main class="w-[100vw] h-[100vh] max-h-[100vh] p-2 flex">
  <div class="flex-1 flex flex-col">
    <CategoryOverview></CategoryOverview>
    <WorkbookOverview></WorkbookOverview>
  </div>
  <div class="flex-1"></div>
</main>
