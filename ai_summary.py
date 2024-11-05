import openai
import json
import os

dirname = os.path.dirname(__file__)
relative_path = lambda dirname, filename: os.path.join(dirname, filename)
def summarize_answers(input_question, json_file_path):  
    # Set your API key
    client = openai.Client(api_key=open(relative_path(dirname, "api_key")).read())

    # Load the JSON file
    with open(json_file_path, 'r') as file:
        data = json.load(file)

    # Find matching question and collect all "Coded Text" entries
    coded_texts_by_name = {}
    sum = 0
    for item in data:
        if any(question == input_question for question in item['Question']):
            for answer in item['Answers']:
                sum += 1
                if "Hierarchical Name" in answer and answer["Hierarchical Name"]:
                    name = answer["Hierarchical Name"]
                    if name not in coded_texts_by_name:
                        coded_texts_by_name[name] = []
                    if "Coded Text" in answer and answer["Coded Text"] is not None:
                        coded_texts_by_name[name].append(answer["Coded Text"])
            break

    if not coded_texts_by_name:
        return "No matching question or answers found."

    # Summarize answers for each "Hierarchical Name"
    summaries = {}
    for name, texts in coded_texts_by_name.items():
        prompt = "Summarize the following answers related to '{name}':\n" + "\n".join(texts)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        summaries[name] = response.choices[0].message.content

    # Display and return results
    print("The number of answers is " + str(sum) + ".")
    print("There are " + str(len(coded_texts_by_name)) + " different code names.")
    for name, summary in summaries.items():
        print("Summary for " + name + ":" + summary + "\n")

# Test
if __name__ == "__main__":
    input_question = "What salinity management strategies do you think are most important or relevant to explore in future scenarios?"
    json_file_path = relative_path(dirname, "Q&A.json")
    summary = summarize_answers(input_question, json_file_path)
    print(summary)
