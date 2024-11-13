from flask import Flask, request
from flask_cors import CORS
import json
import os

# init, do not read data
app = Flask(__name__)
CORS(app)
dirname = os.path.dirname(__file__)
relative_path = lambda dirname, filename: os.path.join(dirname, filename)


@app.route("/test/")
def test():
    return "Hello Delta"


# TODO: Xiyu
@app.route("/codes/overview/")
def get_codes_overview():
    # read the json file
    # return all the research questions and codes and statistics
    return {"some key": "all the research questions and codes and statistics"}


@app.route("/codes/question/", methods=["POST"])
def get_summaries():
    # read the json file
    question = request.json["question"]
    # return the summaries
    pass
