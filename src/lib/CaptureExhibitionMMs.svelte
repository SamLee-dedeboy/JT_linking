<script lang="ts">
  import { server_address } from "constants";
  import { onMount } from "svelte";
  import ExhibitionMmBubbles from "./ExhibitionMMBubbles.svelte";

  let nodes: any[] = $state([]);
  let node_categories: Record<string, { is_top: boolean; is_bottom: boolean }> =
    $state({});
  let loading = $state(false);
  nodes = [
    {
      codes: ["Flow"],
      node: "Flow",
    },
    {
      codes: ["Ecosystem-wide changes"],
      node: "Delta ecosystem",
    },
    {
      codes: ["Native species", "Native fish and native fish health"],
      node: "Salmon and Delta Smelt",
    },
    {
      codes: ["Exports", "Agriculture"],
      node: "Exports and agriculture",
    },
    {
      codes: ["current water rights", "water demand"],
      node: "Over-appropriation of water",
    },
    {
      codes: ["extreme wet years", "extreme dry years"],
      node: "Extreme wet and dry years",
    },
  ];

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
        nodes = data;
        loading = false;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleUpdateNodeCategory(
    node_name: string,
    is_top: boolean,
    is_bottom: boolean,
  ) {
    node_categories[node_name] = { is_top, is_bottom };
  }

  function sort_by_type(a, b) {
    if (a.is_top && !b.is_top) {
      return -1;
    } else if (!a.is_top && b.is_top) {
      return 1;
    } else if (a.is_bottom && !b.is_bottom) {
      return -1;
    } else if (!a.is_bottom && b.is_bottom) {
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
  onMount(() => {
    // start_camera();
  });
</script>

<div class="grow flex flex-col gap-2">
  <div>Exhibition Mental Models</div>

  <div class="flex grow gap-x-2">
    <div class="flex flex-col grow w-[65%] relative">
      <div
        class="flex grow relative p-[0.35rem]"
        class:loading-canvas={loading}
      >
        <!-- <svg id={svgId} class="grow outline-2 outline outline-gray-200"></svg> -->
        <ExhibitionMmBubbles
          svgId="capture-mm-svg"
          {nodes}
          {loading}
          {handleUpdateNodeCategory}
        />
      </div>
      <div class="flex gap-x-1 mt-2">
        <button
          class="h-fit w-max shrink-0 flex flex-col gap-1 items-center py-1 px-2 font-mono rounded outline-2 outline outline-slate-200 bg-slate-100 hover:bg-slate-200"
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
        <div class="flex flex-col gap-2 p-0.5">
          {#each nodes
            .filter((n) => n.node !== "Salinity")
            .sort(sort_by_type) as node}
            <div
              class="flex flex-col border-l-8 border-slate-300 py-1 px-1 rounded shadow-[0_0_3px_0_rgba(0,0,0,0.2)]"
              class:is_top={node_categories[node.node]?.is_top || false}
              class:is_bottom={node_categories[node.node]?.is_bottom || false}
            >
              <div class="font-mono mb-1 px-1">{node.node}</div>
              <div class="flex flex-col gap-1 px-1 text-sm">
                {#each node.codes as code}
                  <div class="code px-1 py-1 rounded">
                    {code}
                  </div>
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
  .loading-canvas {
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
  }
  @keyframes dash {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 200% 150%;
    }
  }
</style>
