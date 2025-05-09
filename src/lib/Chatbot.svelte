<script lang="ts">
  import type { tMessage } from "types";
  import { trim } from "lib/trim";
  import { tick } from "svelte";
  import { server_address } from "constants";
  import { messageState } from "./messages.svelte";
  let messages = $derived(messageState.messages);

  let loading = $state(false);

  async function handleEnter(text: string) {
    messageState.addMessage({
      source: "human",
      content: text,
      render_content: text,
    });
    sendMessages(messages);
    const scrollableDiv = document.querySelector(".messages-container");
    await tick();
    scrollableDiv?.scrollTo({
      top: scrollableDiv.scrollHeight,
      behavior: "smooth",
    });
  }

  function sendMessages(_messages: tMessage[]) {
    console.log("Sending messages:", _messages);
    loading = true;
    fetch(`${server_address}/codes/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: _messages }),
    })
      .then((response) => response.json())
      .then(async (data) => {
        console.log("Chatbot Response:", data);
        await tick();
        const last_message = document.querySelector(
          ".messages-container .message:last-child",
        );
        apply_text_appear_effect(last_message, data["response"]);
        loading = false;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function apply_text_appear_effect(div, text: string) {
    console.log("Applying text appear effect", div);
    let delayed_text = "";
    const steps = generate_steps(text);
    console.log("Steps:", steps);
    messageState.addMessage({
      source: "assistant",
      content: text,
      render_content: delayed_text,
    });
    steps.forEach((step, i) => {
      setTimeout(function () {
        delayed_text += step;
        // div.innerText = delayed_text;
        messages.at(-1)!.render_content = delayed_text;
        if (div) div.scrollTop = div.scrollHeight - div.clientHeight;
      }, i * 30); // 30ms intervals
    });
    function generate_steps(text) {
      let steps: string[] = [];
      let i = 0;
      while (i < text.length) {
        const start = i;
        let end = i + 1;
        if (text[i] === "<") {
          while (text[end] !== ">") {
            end++;
          }
          end++;
        }
        steps.push(text.substring(start, end));
        i = end;
      }
      return steps;
    }
  }
</script>

<div class="px-2 flex flex-col grow relative">
  <div class="absolute top-0 bottom-0 left-0 right-0 flex flex-col p-2">
    <!-- title -->
    <div
      class="flex bg-sky-50 outline outline-2 outline-sky-100 rounded justify-center items-center gap-x-2 text-lg font-bold p-2 text-slate-600 shadow"
    >
      <img src="bot.svg" class="w-8 h-8" alt="" />
      Chatbot
    </div>
    <!-- messages -->
    <div
      class="messages-container border-b border-x border-1 border-gray-200 rounded-b flex flex-col grow py-2 px-2 pr-4 gap-2 overflow-y-auto text-slate-700"
    >
      {#each messages as message}
        <div
          class="message flex flex-col px-2 bg-gray-100"
          class:assistant={message.source === "assistant"}
          class:human={message.source === "human"}
        >
          {message.render_content}
        </div>
      {/each}
      {#if loading}
        <div
          class="message flex px-2 bg-gray-100 animate-pulse"
          class:assistant={true}
        >
          <div class="flex grow justify-center -translate-x-8">
            <img
              src="loader_circle.svg"
              class="w-8 h-8 animate-spin"
              alt="loading"
            />
          </div>
        </div>
      {/if}
    </div>
    <div
      class="flex border border-1 border-gray-200 mt-2 rounded text-slate-800 gap-x-1"
    >
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions, a11y_mouse_events_have_key_events (because of reasons) -->
      <div
        use:trim
        class="input-box min-h-[4rem] px-2 py-1 text-sm grow flex flex-wrap"
        contenteditable
        onkeydown={(e: any) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const text = e.target.innerText;
            handleEnter(text);
            e.target.innerText = "";
          }
        }}
      ></div>
      <button
        class="ml-auto shrink-0 bg-gray-100 hover:outline outline-1 outline-gray-300 rounded px-2 py-1 hover:bg-green-200"
        onclick={() => {
          const input_box = document.querySelector(".input-box") as HTMLElement;
          const text = input_box.innerText;
          if (text) {
            handleEnter(text);
            input_box.innerText = "";
          }
        }}
      >
        <img src="send.svg" class="w-6 h-6" alt="send" />
      </button>
    </div>
  </div>
</div>

<style lang="postcss">
  .assistant {
    @apply bg-sky-100 outline outline-2 outline-blue-200 rounded;
  }
  .assistant::before {
    content: "Assistant";
    @apply text-xs text-slate-700 font-mono;
  }
  .human {
    @apply bg-orange-50 outline outline-2 outline-orange-200 rounded self-end;
  }
  .human::before {
    content: "You";
    @apply text-xs text-slate-700 font-mono;
  }
  .input-box:empty:before {
    content: "Ask anything here...";
    color: gray;
    pointer-events: none;
  }
</style>
