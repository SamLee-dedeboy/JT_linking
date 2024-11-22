from flask import Flask, request
from flask_cors import CORS
import json
import os

# Initialize the Flask app and CORS
app = Flask(__name__)
CORS(app)

dirname = os.path.dirname(__file__)
relative_path = lambda filename: os.path.join(dirname, filename)

# @app.route("/test/")
# def test():
#     return "Hello Delta"

@app.route("/codes/overview/")
def get_codes_overview():
    # Load data from JSON file
    with open(relative_path("interview_codes_and_summary.json"), "r") as f:
        data = json.load(f)

    # Extract the overview
    overview = []
    for entry in data:
        overview.append(
            {
                "question": entry.get("question", []),
                "code_names": entry.get("code_names", []),
                "participants": entry.get("participants"),
                "total_answers": entry.get("total_answers"),
            }
        )
    return overview


@app.route("/codes/question/", methods=["POST"])
def get_summaries():
    # Load data from JSON file
    with open(relative_path("interview_codes_and_summary.json"), "r") as f:
        data = json.load(f)

    # Retrieve the question from the request data
    question = request.json["question"]
    summaries = []

    # Find summaries for the provided question
    for entry in data:
        if question in entry.get("question", []):
            summaries.extend(entry.get("summaries", []))
            break

    return {"question": question, "summaries": summaries}

# @app.route("/")
# def index():
#     return render_template('front-end_test.html')  # Serve the HTML file

if __name__ == "__main__":
    app.run(debug=True)


