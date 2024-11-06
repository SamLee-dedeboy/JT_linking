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
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for generating summaries. Please generate a one-sentence summary for given text. Use the same concise format for each summary, focusing on the main idea of the text. Each summary should be brief and direct."},
                {"role": "user", "content": "\n".join(texts)}
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
    input_question = "What would you rank as having the greatest potential influence/impact?"
    json_file_path = relative_path(dirname, "Q&A.json")
    summary = summarize_answers(input_question, json_file_path)
    print(summary)
