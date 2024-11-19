<script lang="ts">
  import { onMount } from "svelte";

  const server_address = "http://localhost:5000";
  let hello_message = "Request not received yet.";
  function fetchTest() {
    // fetch data from backend
    fetch(server_address + "/test/")
      .then((res) => res.text())
      .then((res) => {
        console.log({ res });
        hello_message = res;
      });
  }
  onMount(() => {
    fetchTest();
  });
</script>

<main>{hello_message}</main>

<style>
</style>
