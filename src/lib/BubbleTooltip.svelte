<script lang="ts">
  let { bubble } = $props();
  import { server_address } from "constants";
  import { bubble_color, setOpacity } from "constants/colors";

  $effect(() => {
    if (bubble) {
      fetchSummarization();
    }
  });
  function fetchSummarization() {
    console.log(
      "Fetching summarization for bubble:",
      bubble,
      bubble.id.split("\\").at(-1),
    );

    return fetch(`${server_address}/codes/summarize/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: bubble.data }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Summarization", data);
        return data["response"];
      })
      .catch((error) => {
        console.error("Error:", error);
        return "";
      });
  }
</script>

<div class="tooltip-content text-slate-700 text-lg">
  <p>
    You're looking at participant responses about
    <span
      class="text-slate-800 italic font-semibold px-1 py-0.5 rounded"
      style={`background-color: ${setOpacity(bubble_color(bubble.id.split("\\").at(0)), 0.7, "rgbHex")}`}
    >
      {bubble.id.split("\\").at(-1)}
    </span>
  </p>
  <p>
    <span class="text-slate-900 font-semibold underline">
      {bubble.data.participants.length}
    </span>
    participants mentioned this in the interview.
  </p>
  <p class="bg-slate-300 px-2 py-1 rounded">
    A summary of the participants responses:
  </p>
  <p
    class="text-slate-700 text-sm bg-gray-200 mx-1 px-2 py-1 rounded shadow-md"
  >
    - Freshwater flow is essential to push back saltwater intrusion in Delta
    ecosystems. - Groundwater recharge projects are necessary to store
    freshwater for combating salinity and improving system resilience. - Climate
    change demands strategies to manage increased rainfall and flood flows while
    addressing water scarcity. - Building more reservoirs may not be a
    comprehensive solution to Delta salinity issues. - Erosion and soil health
    are critical considerations for managing Delta watersheds effectively.
  </p>
  <!-- {#await fetchSummarization()}
    <p>...</p>
  {:then summarization}
    <p class="text-slate-700 text-sm whitespace-pre-wrap">
      {summarization.length > 0 ? summarization : "No summary available."}
    </p>
  {/await} -->
</div>
