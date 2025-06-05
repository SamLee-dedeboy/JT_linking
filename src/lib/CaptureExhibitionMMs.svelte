<script lang="ts">
  import { server_address } from "constants";
  import { onMount, tick } from "svelte";
  import ExhibitionMmBubbles from "./ExhibitionMMBubbles.svelte";
  import CodeEditor from "./CodeEditor.svelte";

  let nodes: {
    node: string;
    classification: string;
    codes: { code: string; parent: string }[];
  }[] = $state([]);
  let links: [string, string][] | undefined = $state(undefined);
  let MM_id = $state("7045");
  let codebook: any[] = $state([]);
  let node_categories: Record<string, { is_top: boolean; is_bottom: boolean }> =
    $state({});
  let loading = $state(false);
  let MmBubbles: any = $state();
  // nodes = [
  //   {
  //     classification: "impacted by salinity",
  //     codes: [
  //       {
  //         code: "Policy & Regulatory Environment",
  //         parent: "N/A",
  //       },
  //       {
  //         code: "decision-making process",
  //         parent: "Policy & Regulatory Environment",
  //       },
  //     ],
  //     node: "past decision making",
  //   },
  //   {
  //     classification: "impacts salinity",
  //     codes: [
  //       {
  //         code: "Agriculture",
  //         parent: "N/A",
  //       },
  //     ],
  //     node: "agriculture",
  //   },
  //   {
  //     classification: "impacts salinity",
  //     codes: [
  //       {
  //         code: "modeling",
  //         parent: "Information Sources",
  //       },
  //     ],
  //     node: "projections",
  //   },
  //   {
  //     classification: "impacted by salinity",
  //     codes: [
  //       {
  //         code: "Native species",
  //         parent: "N/A",
  //       },
  //       {
  //         code: "Native fish and native fish health",
  //         parent: "Native species",
  //       },
  //     ],
  //     node: "delta smelt",
  //   },
  //   {
  //     classification: "impacted by salinity",
  //     codes: [
  //       {
  //         code: "Native species",
  //         parent: "N/A",
  //       },
  //     ],
  //     node: "delta species/wildlife",
  //   },
  //   {
  //     classification: "impacts salinity",
  //     codes: [
  //       {
  //         code: "Flow",
  //         parent: "N/A",
  //       },
  //       {
  //         code: "reservoir operations / storage",
  //         parent: "Flow",
  //       },
  //     ],
  //     node: "reservoir management",
  //   },
  //   {
  //     classification: "impacts salinity",
  //     codes: [
  //       {
  //         code: "Flow",
  //         parent: "N/A",
  //       },
  //     ],
  //     node: "hydrology",
  //   },
  //   {
  //     classification: "impacted by salinity",
  //     codes: [
  //       {
  //         code: "Human Dimensions",
  //         parent: "N/A",
  //       },
  //     ],
  //     node: "delta communities",
  //   },
  //   {
  //     classification: "impacted by salinity",
  //     codes: [
  //       {
  //         code: "Natural Climate",
  //         parent: "N/A",
  //       },
  //     ],
  //     node: "weather",
  //   },
  // ];

  // links = [
  //   ["delta communities", "salinity"],
  //   ["salinity", "reservoir management"],
  //   ["weather", "salinity"],
  //   ["agriculture", "salinity"],
  //   ["salinity", "delta species wildlife"],
  //   ["hydrology", "salinity"],
  //   ["salinity", "predictions"],
  //   ["past decision making", "salinity"],
  //   ["salinity", "delta smelt"],
  // ];
  function transcribe(imageData) {
    loading = true;
    // bubble_renderer.updateLoading(loading);
    fetch(`${server_address}/mental_model/transcribe/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageData }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        nodes = data.codes;
        // const node_bubble_data = nodes.map((node) => {
        //   return { node: node.node, classification: node.classification };
        // });
        MmBubbles.update_node_classification(nodes);
        MmBubbles.update(nodes);

        // links = data.links || [];
        MM_id = data.id;
        loading = false;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  async function fetchCodebook() {
    return fetch(`${server_address}/codebook/`)
      .then((response) => response.json())
      .then((data) => {
        console.log("codebook", data);
        return data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  async function updateCapturedMM() {
    fetch(`${server_address}/mental_model/update/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ codes: nodes, id: MM_id }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  async function handleUpdateNodeCategory(
    node_name: string,
    is_top: boolean,
    is_bottom: boolean,
  ) {
    node_categories[node_name] = { is_top, is_bottom };
    const node_index = nodes.findIndex((n) => n.node === node_name);
    if (node_index !== -1) {
      let changed =
        nodes[node_index].classification !==
        (is_top
          ? "impacts salinity"
          : is_bottom
            ? "impacted by salinity"
            : "N/A");
      if (changed) {
        nodes[node_index].classification = is_top
          ? "impacts salinity"
          : is_bottom
            ? "impacted by salinity"
            : "N/A";
        console.log("changed", nodes[node_index].node);
        updateCapturedMM();
        // const node_bubble_data = nodes.map((node) => {
        //   return { node: node.node, classification: node.classification };
        // });
        MmBubbles.update_node_classification(nodes);
      }
    }
  }

  function sort_by_type(a, b) {
    const a_is_top = node_categories[a.node]?.is_top || false;
    const b_is_top = node_categories[b.node]?.is_top || false;
    const a_is_bottom = node_categories[a.node]?.is_bottom || false;
    const b_is_bottom = node_categories[b.node]?.is_bottom || false;
    if (a_is_top && b_is_top) {
      return 0;
    } else if (a_is_bottom && b_is_bottom) {
      return 0;
    } else if (a_is_top && b_is_bottom) {
      return -1;
    } else if (a_is_bottom && b_is_top) {
      return 1;
    }
  }

  function start_camera() {
    const video: any = document.getElementById("video");

    // Request access to the webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((err) => {
        console.error("Error accessing webcam: ", err);
      });
  }
  onMount(async () => {
    // start_camera();
    // const node_bubble_data = nodes.map((node) => {
    //   return { node: node.node, classification: node.classification };
    // });
    MmBubbles.update_node_classification(nodes);
    MmBubbles.update(nodes);
    nodes.forEach((node) => {
      node_categories[node.node] = {
        is_top: node.classification === "impacts salinity",
        is_bottom: node.classification === "impacted by salinity",
      };
    });
    codebook = await fetchCodebook();
  });
</script>

<div class="grow flex flex-col gap-2">
  <div class="jt-section-title text-center text-[1.5rem] text-white">
    <!-- Exhibition Mental Models -->
  </div>

  <div class="flex grow gap-x-2 mt-1">
    <div class="flex flex-col grow w-[65%] relative">
      <div class="flex grow relative" class:loading-canvas={loading}>
        <!-- <svg id={svgId} class="grow outline-2 outline outline-gray-200"></svg> -->
        <ExhibitionMmBubbles
          bind:this={MmBubbles}
          svgId="capture-mm-svg"
          {loading}
          handleClickNode={(node_name) => {
            const element = document.querySelector(
              `[data-node="${node_name}"]`,
            );
            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              element.classList.add("highlighted");
              setTimeout(() => {
                element.classList.remove("highlighted");
              }, 1500);
              // element.parentElement.classList.add("highlighted");
              // setTimeout(() => {
              //   element.parentElement.classList.remove("highlighted");
              // }, 1500);
            }
          }}
          {handleUpdateNodeCategory}
        />
      </div>
      <div class="flex gap-x-1 mt-2">
        <button
          class="h-fit w-max shrink-0 flex flex-col gap-1 items-center py-1 px-2 rounded outline-2 outline outline-slate-200 bg-slate-100 hover:bg-slate-200"
          onclick={() => {
            const video: any = document.getElementById("video");
            const canvas: any = document.getElementById("canvas");
            const context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            transcribe(canvas.toDataURL("image/png"));
          }}
        >
          <img src="camera.svg" alt="camera" class="w-6 h-6" />
          Capture
        </button>
        <video id="video" width="320" height="240" autoplay></video>
        <canvas id="canvas" width="320" height="240"></canvas>
      </div>
    </div>
    <div class="w-[35%] grow relative">
      <div class="absolute left-0 right-0 top-0 bottom-0 overflow-auto pr-3">
        <div class="flex flex-col gap-2 px-1">
          <!-- {#each nodes
            .filter((n) => n.node !== "Salinity")
            .sort(sort_by_type) as node} -->
          {#each nodes
            .filter((n) => n.node !== "Salinity")
            .sort((a, b) => a.node.localeCompare(b.node)) as node}
            <div
              class="jt-body-2 flex flex-col outline outline-2 outline-[#0b1012] border-l-8 border-slate-300 bg-gray-200 rounded"
              class:is_top={node_categories[node.node]?.is_top || false}
              class:is_bottom={node_categories[node.node]?.is_bottom || false}
            >
              <div
                data-node={node.node}
                class="mb-1 py-1 px-2 text-slate-800 text-lg"
                contenteditable="true"
                onblur={(e: any) => {
                  const node_index = nodes.findIndex(
                    (n) => n.node === node.node,
                  );
                  nodes[node_index].node = e.target.innerText;
                  updateCapturedMM();
                  MmBubbles.update_node_classification(nodes);
                  MmBubbles.update(nodes);
                  console.log("onchange", nodes[node_index].node);
                }}
              >
                {node.node}
              </div>
              <div class="flex flex-col gap-2 px-1 pb-1">
                {#each node.codes as code_data, index}
                  <CodeEditor
                    {code_data}
                    {codebook}
                    handleChangeCode={(new_code, parent) => {
                      node.codes[index] = {
                        code: new_code,
                        parent: parent,
                      };
                      updateCapturedMM();
                    }}
                    handleDeleteCode={() => {
                      node.codes.splice(index, 1);
                      updateCapturedMM();
                    }}
                  ></CodeEditor>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  /* .loading-canvas {
    position: relative;
    background: linear-gradient(
      90deg,
      #c2e2fd 20%,
      #87f2f7 40%,
      #86c6ff 60%,
      transparent 80%
    );
    background-size: 200% 200%;
    animation: dash 3s linear infinite;
  } */

  @keyframes dash {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 200% 150%;
    }
  }
  .is_top {
    border-color: #a2bffd;
  }
  .is_bottom {
    border-color: oklch(52% 0.105 223.128);
  }
  :global(.highlighted) {
    /* border: solid 8px #7ed957 !important; */
    background-color: #7ed957 !important;
    /* color: #285417; */
    transition: all 0.5s ease;
  }
</style>
