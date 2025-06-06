<script lang="ts">
  import { onMount } from "svelte";
  import { server_address } from "constants";
  import { MentalModelRenderer } from "renderers/MentalModelRenderer";
  import CodeTooltip from "./CodeTooltip.svelte";
  const svgId = "mental_model_svg";
  let bubble_renderer: MentalModelRenderer = new MentalModelRenderer(
    svgId,
    showCodeTooltip,
  );
  let codebook: any = $state([]);
  let code_tsne: Record<string, number> = $state({});
  let parent_dict = $derived(
    codebook.reduce((acc, code) => {
      acc[code.name] = code.parent;
      return acc;
    }, {}),
  );
  let server_data: any = $state(undefined);
  let selected_code: string | undefined = $state(undefined);
  function fetchMMs() {
    fetch(`${server_address}/mental_model/results/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        server_data = data;
        console.log("server data", server_data);
        let render_data = Object.keys(data).reduce((acc, code) => {
          let parent_code = parent_dict[code];
          if (parent_code === "N/A") {
            parent_code = code; // If no parent, use the code itself
          }
          if (!acc[parent_code]) {
            acc[parent_code] = [];
          }
          acc[parent_code] = Array.from(
            new Set(acc[parent_code].concat(data[code])),
          );
          return acc;
        }, {});
        render_data = Object.keys(render_data).reduce((acc, code) => {
          acc[code] = render_data[code].length;
          return acc;
        }, {});
        console.log("Mental Models:", render_data);
        // Process the data as needed
        bubble_renderer.update(render_data, codebook, code_tsne);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function showCodeTooltip([code, frequency]: [string, number]) {
    console.log("Code Tooltip:", code, frequency, server_data[code]);
    selected_code = code;
  }

  function fetchCodebook() {
    fetch(`${server_address}/codebook/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Codebook:", data);
        codebook = data;
        fetchMMs();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function fetchCodeTsne() {
    fetch(`${server_address}/codebook/parent_tsne/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("TSNE Data:", data);
        code_tsne = data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  onMount(() => {
    fetchCodebook();
    fetchCodeTsne();
    bubble_renderer.init();
  });
</script>

<div id="MM" class="grow">
  <!-- <div class="jt-section-title text-center text-[1.5rem] text-white">
    Interview Mental Models
  </div> -->
  <svg id={svgId} class="w-full h-full"></svg>

  {#if server_data && selected_code}
    <div
      class="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center"
    >
      <div
        class="absolute top-0 bottom-0 left-0 right-0 bg-[#253439] opacity-80"
      ></div>
      <div class="z-10 max-w-[40rem]">
        <CodeTooltip
          {codebook}
          all_code_participants={server_data}
          {selected_code}
          handleClose={() => (selected_code = undefined)}
        ></CodeTooltip>
      </div>
    </div>
  {/if}
</div>
