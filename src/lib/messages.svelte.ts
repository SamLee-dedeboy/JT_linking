import type { tMessage } from "types";
let messages: tMessage[] = $state([
    {
      source: "assistant",
      content: "Hi! Ask me anything about the scenarios and interviews.",
      render_content: "Hi! Ask me anything about the scenarios and interviews.",
    },
  ]);
export const messageState = {
    get messages() {
      return messages;
    },
    set messages(newMessages) {
        messages = newMessages;
    },
    addMessage(newMessage: tMessage) {
        messages.push(newMessage);
    }
}
