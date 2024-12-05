from GPTUtils import query
import json


def gpt_applicable_categories(client, user_question, category_rqs):
    # First, figure out which code the user question belongs to [Value, Drivers, Governance, Strategies] using the research questions
    list_of_categories = ", ".join([c["category"] for c in category_rqs])
    example_questions = ""
    for category in category_rqs:
        example_questions += f"{category['category']}: \n"
        for rq in category["research_questions"]:
            example_questions += f"{rq}\n"
        example_questions += "\n\n"
    prompt = [
        {
            "role": "system",
            "content": f"""You are a system that helps users find relevant information from interviews about the Sacramento-San Joaquin Delta.
            The user is exploring a set of transcripts, categorized into: {list_of_categories}.
            For each category, here are some example research questions:
            {example_questions} 
            The user will ask you a question, and you need to determine which category the question belongs to.
            Reply with all the applicable categories. If none of the categories are applicable, reply with "None".
            Reply with the following JSON format:
            {{
                "applicable_categories": [] or "None"
            }}
            """,
        },
        {"role": "user", "content": user_question},
    ]
    response = query.request_gpt(client, prompt, model="gpt-4o-mini", format="json")
    response = json.loads(response)
    if response["applicable_categories"] == "None":
        return None
    return response["applicable_categories"]


def gpt_filter_direct_answers(client, user_question, summaries):
    # use another prompt to filter the summaries to only include the summaries that directly answers user question
    summaries_str = ""
    for i, s in enumerate(summaries):
        summaries_str += f"{i} - {s['code_name']}: "
        summaries_str += s["summary"] + "\n\n"
    prompt = [
        {
            "role": "system",
            "content": f"""You are a system that helps users find relevant information from interviews about the Sacramento-San Joaquin Delta.
            The user has found a list of document summaries that could be relevant to their question: {user_question}.
            The documents are: {summaries_str}
            Please filter the summaries to only include the ones that directly answer the user question.
            If none of the summaries directly answer the question, reply with an empty list.
            Reply with the indices of the summaries in the following JSON format:
            {{
                "filtered_summaries_indices": [] (list of indices in integers)
            }}
            """,
        },
        {
            "role": "user",
            "content": "Please return the indices of the summaries that directly answer the question.",
        },
    ]
    response = query.request_gpt(client, prompt, model="gpt-4o-mini", format="json")
    response = json.loads(response)["filtered_summaries_indices"]
    return response


def get_relevant_summer_notes(client, data, question, codes):
    first_level_subtopics = [
        {
            "parent": node["name"],
            "subtopic": child["name"],
        }
        for node in data
        for child in node["children"]
    ]
    list_of_subtopics_str = "\n".join(
        [
            f"{i+1}: {s['parent'] + ': ' + s['subtopic']}"
            for i, s in enumerate(first_level_subtopics)
        ]
    )
    prompts = []
    for code in codes:
        answer = code["code_name"] + ": " + code["summary"]
        system_prompt = """You are a system that helps users find relevant discussion notes from a discussion notes document.
        The document content is a list of discussion notes, as follows: {list_of_subtopics_str} \n
        The user will give you a question and their answer to the question. The user wants to know if their answer might have been discussed in the document. 
        You need to determine which note is relevant to the question and their answer, and explain why.
        Reply with the following JSON format:
        {{
            relevant_notes: [
                {{
                    "index": (int) index of the note,
                    "explanation": "explanation of why the note is relevant"
                }},
                ...
            ]
        }}
        """.format(
            list_of_subtopics_str=list_of_subtopics_str
        )
        user_prompt = f"""Question: {question}\n\n Answer:\n {answer}."""
        prompt = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        prompts.append(prompt)
    responses = query.multithread_prompts(
        client, prompts, model="gpt-4o-mini", format="json"
    )
    responses = [json.loads(response)["relevant_notes"] for response in responses]
    res = {}
    for code_index, code_responses in enumerate(responses):
        code = codes[code_index]["code_name"]
        for response in code_responses:
            if code not in res:
                res[code] = []
            res[code].append(
                {
                    "title": first_level_subtopics[int(response["index"]) - 1][
                        "parent"
                    ],
                    "discussion": first_level_subtopics[int(response["index"]) - 1][
                        "subtopic"
                    ],
                    "explanation": response["explanation"],
                }
            )
    return res
