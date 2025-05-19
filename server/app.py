from flask import Flask, request, jsonify
import glob
import random
from flask_cors import CORS
import json
import os
import re
from collections import defaultdict
from openai import OpenAI
import GPTUtils.prompts as prompts
import AutoGenUtils.query as query

dirname = os.path.dirname(__file__)
relative_path = lambda filename: os.path.join(dirname, filename)
client = OpenAI(api_key=open("api_key").read(), timeout=10)

# Initialize the Flask app and CORS
UPLOAD_FOLDER = relative_path("/upload/mental_model_sketches")
ALLOWED_EXTENSIONS = set(["txt", "pdf", "png", "jpg", "jpeg", "gif"])
app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
CORS(app)


def save_json(data, filename):
    with open(filename, "w") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


@app.route("/test/")
def test():
    return "Hello Delta"


@app.route("/scenarios/")
def get_scenarios():
    data = json.load(open(relative_path("data/scenarios.json")))
    return data


@app.route("/scenarios/codes_manual/", methods=["POST"])
def get_scenario_codes_manual():
    scenario = request.json["scenario"]
    data = json.load(open(relative_path("data/scenario_codes_manual.json")))
    code_freq = json.load(open(relative_path("data/code_freq.json")))
    node_dict = {code["name"]: code for code in code_freq}
    # code_freq_dict = {code["name"]: code for code in code_freq}
    if scenario in data:
        codes = data[scenario]
        codes = remove_duplicates(codes)
        codes = [
            c for c in codes if c in node_dict
        ]  # remove codes that are not in code_freq
        node_dict = collect_scenario_children(codes, node_dict)
        root = {
            "name": "root",
            "scenario_children": list(set([c.split("\\")[0] for c in codes])),
        }
        node_dict["root"] = root
        root = dfs_collect_reference(root, node_dict)
        new_node_dict = filter_node_dict(root, node_dict)
        code_w_freq = [
            {
                "code_name": code,
                "occurrences": node_dict[code]["references_count"],
            }
            for code in codes
        ]
        return {
            "occurrences": code_w_freq,
            "participants": list(new_node_dict.values()),
        }
    else:
        return []


@app.route("/mental_model/results/", methods=["GET"])
def get_mm_results():
    all_MMs = defaultdict(int)
    code_book = json.load(open(relative_path("data/MMs/all_codes.json")))

    parent_code_dict = {}  # from code to parent code
    for code in code_book:
        code_name = code["name"]
        parent_code = code["parent"]
        if parent_code != "N/A":
            parent_code_dict[code_name] = parent_code
        else:
            parent_code_dict[code_name] = code_name
    for participant_MM_file in glob.glob(relative_path("data/MMs/participants/*.json")):
        participant_MM = json.load(open(participant_MM_file))
        participant_MM = list(filter(lambda x: x["mentioned"], participant_MM))
        participant_MM = list(filter(lambda x: x["impact"], participant_MM))
        participant_MM = list(
            filter(
                lambda x: x["logical_connection"] == "Good"
                and x["significance"] == "Good"
                and x["relevance"] == "Good",
                participant_MM,
            )
        )
        # code_names = set([c["code_name"] for c in participant_MM])
        code_names = set(
            [parent_code_dict[c["code_name"]] for c in participant_MM]
        )  # keep only the parent code
        for c in code_names:
            all_MMs[c] += 1
    return all_MMs


# @app.route("/scenarios/connection/", methods=["POST"])
# def get_scenario_connection():
#     code = request.json["code"]
#     data = json.load(open(relative_path("data/code_to_scenarios.json")))
#     if code in data:
#         return data[code]
#     else:
#         return []


# @app.route("/codes/overview/")
# def get_codes_overview():
#     # Load data from JSON file
#     data = json.load(
#         open(relative_path("data/interview_codes_and_summary_w_freq.json"), "r")
#     )

#     # reverse index by Demographics, Values, Drivers, Governance, and Strategy
#     example_questions = []
#     for question_data in data:
#         category_codes = list(
#             set([code_name.split("\\")[0] for code_name in question_data["code_names"]])
#         )
#         assert len(category_codes) == 1
#         category_code = category_codes[0]
#         example_questions.append(
#             {
#                 "category": category_code,
#                 "question": question_data["question"][:-1],
#                 "summaries": question_data["summaries"],
#             }
#         )

#     return {
#         "questions": example_questions,
#     }


@app.route("/codes/chat/", methods=["POST"])
async def codes_chat():
    messages = request.json["messages"]
    response, messages = await query.chat(
        messages, "gpt-4o-mini", open("api_key").read().strip(), temperature=1
    )
    return {"response": response}


@app.route("/codes/summarize/", methods=["POST"])
async def codes_summarize():
    code = request.json["code"]
    references = code["references"]
    references_text = ""
    for ref in references:
        participant_text = ref["participant"]
        match = re.search(r"Files\\\\([A-Z]+) Transcript", participant_text)
        if match:
            participant = match.group(1)  # Output: AF or ABC
        else:
            participant = "unknown"
        references_text += """
        <reference>
            <reference_text> {reference} </reference_text>
            <from_participant> {participant} </from_participant>
        </reference
        """.format(
            reference=ref["reference"], participant=participant
        )

    print(references_text)
    messages = [
        {
            "source": "user",
            "content": """
            Summarize the references for me in a concise way. Use only one short sentence for each bullet point.
            Give me no more than 5 bullet points.
            References: {references_text}   
            """.format(
                references_text=references_text
            ),
        }
    ]
    response, messages = await query.chat(
        messages, "gpt-4o-mini", open("api_key").read().strip(), temperature=1
    )
    return {"response": response}


@app.route("/codes/ask/", methods=["POST"])
async def codes_ask():
    code = request.json["code"]
    references = code["references"]
    response = "Here are the references for the code you ask about: \n"
    for ref in references:
        participant_text = ref["participant"]
        match = re.search(r"Files\\\\([A-Z]+) Transcript", participant_text)
        if match:
            participant = match.group(1)  # Output: AF or ABC
        else:
            participant = "unknown"
        response += """
        <reference>
            <reference_text> {reference} </reference_text>
            <from_participant> {participant} </from_participant>
        </reference
        """.format(
            reference=ref["reference"], participant=participant
        )
    return {"response": response}


# @app.route("/codes/question/", methods=["POST"])
# def find_answers():
#     user_question = request.json["question"]
#     print("User question: ", user_question)
#     category_rqs = json.load(open("data/category_rqs.json"))
#     applicable_categories = prompts.gpt_applicable_categories(
#         client, user_question, category_rqs
#     )
#     print("Applicable categories: ", applicable_categories)
#     all_summaries = json.load(open("data/all_summaries.json"))
#     filtered_summaries = [
#         s
#         for s in all_summaries
#         if s["code_name"].split("\\")[0] in applicable_categories
#     ]
#     direct_answer_indices = prompts.gpt_filter_direct_answers(
#         client, user_question, filtered_summaries
#     )
#     direct_answers = [filtered_summaries[i] for i in direct_answer_indices]
#     return json.dumps(direct_answers)


# @app.route("/codes/content/", methods=["POST"])
# def find_content():
#     try:
#         request_data = request.get_json()
#         if not request_data:
#             return jsonify({"error": "Invalid request: No data provided"}), 400

#         selected_category = request_data.get("selectedCategory")
#         selected_scenario = request_data.get("selectedScenario")

#         if not selected_category or not selected_scenario:
#             return (
#                 jsonify({"error": "Invalid request: Missing category or scenario"}),
#                 400,
#             )

#         data_file_path = relative_path("data/workbook_mappings.json")
#         with open(data_file_path, "r") as file:
#             data = json.load(file)

#         results = []
#         category_data = data.get(selected_category, [])
#         for entry in category_data:
#             if len(entry) > 2 and entry[2] == selected_scenario:
#                 results.append({"value1": entry[0], "value2": entry[1]})

#         return jsonify({"results": results})
#     except FileNotFoundError:
#         return jsonify({"error": "Data file not found"}), 500
#     except json.JSONDecodeError:
#         return jsonify({"error": "Failed to decode JSON data"}), 500
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @app.route("/summer_discussion/overview/", methods=["GET"])
# def get_summer_institute_overview():
#     data = json.load(open("data/summer_institute_discussion.json"))
#     return data


# @app.route("/summer_discussion/question/", methods=["POST"])
# def get_summer_institute_question():
#     question = request.json["question"]
#     codes = request.json["codes"]
#     data = json.load(open("data/summer_institute_discussion.json"))
#     relevant_summaries = prompts.get_relevant_summer_notes(
#         client, data, question, codes
#     )
#     return relevant_summaries


@app.route("/keywords/", methods=["GET"])
def get_keywords():
    data = json.load(open("data/keywords.json"))
    data_as_dict = {k["name"]: k["description"] for k in data}
    return data_as_dict


@app.route("/mental_model/transcribe/", methods=["POST"])
def transcribe_MM():
    codebook = json.load(
        open(relative_path("data/all_codes.json"), "r", encoding="utf-8")
    )
    all_code_names = [code["name"] for code in codebook]
    # image_data = request.json["image"]
    data = request.get_json()
    image_data = data.get("image")
    api_key = open(relative_path("api_key")).read().strip()
    response = query.transcribe_mental_model(image_data, api_key=api_key)
    nodes = response.split(";")
    codes = []
    for node in nodes:
        node = node.strip()
        try:
            if node.lower() in ["salinity", "salinity management"]:
                continue
            response = query.code_classification(node, codebook, api_key=api_key)
            response = json.loads(response)["matched_codes"]
            print(node, response)
            response = list(filter(lambda x: x in all_code_names, response))
            codes.append({"node": node, "codes": response})
        except Exception as e:
            print(f"Error processing node {node}: {e}")
            continue
    id = random.randint(0, 100000)
    existing_files = [
        file.split("/")[-1].split(".")[0]
        for file in glob.glob(relative_path("data/exhibition/*.json"))
    ]
    while id in existing_files:
        id = random.randint(0, 100000)
    save_json(codes, relative_path(f"data/exhibition/{id}.json"))
    return codes


@app.route("/mental_model/exhibition/", methods=["GET"])
def get_exhibition_MM():
    files = glob.glob(relative_path("data/exhibition/*.json"))
    exhibition_MMs = []
    for file in files:
        with open(file, "r") as f:
            data = json.load(f)
            exhibition_MMs.append(data)
    return exhibition_MMs


def remove_duplicates(codes):
    no_duplicates = []
    for i in range(len(codes)):
        find_duplicate = False
        for j in range(len(codes)):
            if i != j and codes[i] in codes[j]:
                find_duplicate = True
                break
        if not find_duplicate:
            no_duplicates.append(codes[i])
    return list(set(no_duplicates))


def collect_scenario_children(nodes, node_dict):
    hierarchy = {}
    parent_dict = {}
    for node in nodes:
        for i in range(1, len(node.split("\\"))):
            parent = "\\".join(node.split("\\")[:i])
            child = "\\".join(node.split("\\")[: i + 1])
            if parent not in hierarchy:
                hierarchy[parent] = set()
            hierarchy[parent].add(child)
            if child not in hierarchy:
                hierarchy[child] = set()
                parent_dict[child] = set()
            parent_dict[child].add(parent)
    for node, children in hierarchy.items():
        node_dict[node]["scenario_children"] = list(children)
    return node_dict


def dfs_collect_reference(node, node_dict):
    node["participants"] = set()
    node["references_count"] = 0
    if len(node["scenario_children"]) == 0:
        node_dict[node["name"]]["participants"] = list(
            set([r["participant"] for r in node["references"]])
        )
        node_dict[node["name"]]["references_count"] = len(node["references"])
        return node_dict[node["name"]]
    for child in node["scenario_children"]:
        child = dfs_collect_reference(node_dict[child], node_dict)
        node["participants"].update(child["participants"])
        node["references_count"] += child["references_count"]
    node_dict[node["name"]]["participants"] = list(
        node_dict[node["name"]]["participants"]
    )
    return node_dict[node["name"]]


def filter_node_dict(root, node_dict, new_node_dict={}):
    stack = [root]
    while len(stack) > 0:
        current = stack.pop()
        new_node_dict[current["name"]] = current
        for child in current["scenario_children"]:
            stack.append(node_dict[child])
    return new_node_dict


if __name__ == "__main__":
    app.run(debug=True)
