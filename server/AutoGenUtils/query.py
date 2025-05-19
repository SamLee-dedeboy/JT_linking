import asyncio
import io
import json
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.messages import TextMessage
from autogen_core import CancellationToken
from openai import OpenAI


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


import base64


# Function to encode the image
def encode_image(image):
    return base64.b64encode(image.read()).decode("utf-8")


def transcribe_mental_model(image_data, api_key: str = None) -> str:
    """
    Sends a hand-drawn mental model image to OpenAI's Vision API and returns a bullet list of nodes.

    Parameters:
        image_path (str): Path to the image file.
        api_key (str): Your OpenAI API key. If None, it uses the key from the environment variable.

    Returns:
        str: A bullet list of nodes from the mental model.
    """

    # Read and encode the image as base64
    # base64_image = encode_image(image)
    # header, encoded = image_data.split(',', 1)
    # base64_image = base64.b64decode(encoded)
    header, encoded = image_data.split(",", 1)
    binary_data = base64.b64decode(encoded)

    # Create a file-like object from binary data
    image_stream = io.BytesIO(binary_data)
    base64_image = encode_image(image_stream)

    client = OpenAI(api_key=api_key)
    # Prepare the message to GPT-4 with Vision
    response = client.responses.create(
        model="gpt-4o",
        input=[
            {
                "role": "system",
                "content": "You are a helpful assistant that extracts node labels from visual mental models.",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": (
                            "Please transcribe the node labels in this hand-drawn mental model diagram. "
                            "Output only a clean list of the node labels separated by semicolon, no extra commentary."
                        ),
                    },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/jpeg;base64,{base64_image}",
                    },
                ],
            },
        ],
    )

    return response.output_text


def code_classification(node, codebook, api_key):
    """
    Classifies the given code using the provided codebook.

    Parameters:
        code (str): The code to classify.
        codebook (dict): A dictionary mapping codes to their classifications.

    Returns:
        str: The classification of the code.
    """
    code_book_str = json.dumps(codebook, ensure_ascii=False)
    prompts = [
        {
            "role": "system",
            "content": """You are a research assistant. You are given a codebook, and the user will give you a label. Your task is to classify the label according to the codebook.
            Here is the codebook:
            {code_book_str}
            Reply with the codes that best match the label. Do not return an empty list.
            Reply with the following JSON format:
            {{
                "matched_codes": str[]
            }}
            """.format(
                code_book_str=code_book_str
            ),
        },
        {"role": "user", "content": "label: {node}".format(node=node)},
    ]
    client = OpenAI(api_key=api_key)
    response = client.responses.create(
        model="gpt-4o",
        input=prompts,
        text={"format": {"type": "json_object"}},
    )
    return response.output_text


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
