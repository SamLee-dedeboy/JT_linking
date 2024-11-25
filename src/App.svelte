<script lang="ts">
  import { onMount } from "svelte";
  import { server_address, categories } from "./constants";
  import CategoryOverview from "lib/CategoryOverview.svelte";
  import SearchInput from "lib/SearchInput.svelte";
</script>

<main class="w-[100vw] h-[100vh] p-2">
  <CategoryOverview></CategoryOverview>
  <div
    class="absolute left-[50%] top-[80%] -translate-x-1/2 min-w-[20rem] shadow-[0px_0px_4px_1.5px_#a3a3a3] rounded"
  >
    <SearchInput></SearchInput>
  </div>
</main>
