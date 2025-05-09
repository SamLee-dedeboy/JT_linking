import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.messages import TextMessage
from autogen_core import CancellationToken


def init_model(model: str, api_key: str, temperature: float = 1):
    model_client = OpenAIChatCompletionClient(
        model=model, api_key=api_key, temperature=temperature
    )
    question_answering_agent = AssistantAgent(
        name="question_answering_agent",
        model_client=model_client,
        system_message="""
        ** Context **
        You are a research assistant participating in a water resource management project called "Just Transitions".
        The project is about future scenarios for the Sacramento-San Joaquin Delta focused on salinity management and climate change adaptation. 
        This research aims to diversify public and stakeholder participation in considering and assessing future salinity management options for the Delta. 
        ** Task **
        You are tasked with answering public questions about the project. Answer the user's questions to the best of your ability.
        """,
    )
    return question_answering_agent


async def chat(messages: list, model: str, api_key: str, temperature: float = 1):
    agent = init_model(model=model, api_key=api_key, temperature=temperature)
    messages = messages_reformat(messages)
    response = await agent.on_messages(
        messages=messages,
        cancellation_token=CancellationToken(),
    )
    response = response.chat_message.content
    messages = add_message(response, "assistant", messages)
    messages = [m.model_dump(mode="json") for m in messages]
    return response, messages


def messages_reformat(messages: list):
    return [
        TextMessage(content=message["content"], source=message["source"])
        for message in messages
    ]


def add_message(message: str, source: str, messages: list[TextMessage]):
    messages.append(TextMessage(content=message, source=source))
    return messages


async def main() -> None:
    model = "gpt-4o-mini"
    api_key = open("../api_key").read().strip()
    agent = init_model(model, api_key)
    messages = [{"content": "Introduce me to the project.", "source": "user"}]
    messages = messages_reformat(messages)
    response, messages = await chat(agent, messages)
    print(response)
    print(messages)


if __name__ == "__main__":
    asyncio.run(main())
