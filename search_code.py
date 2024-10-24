from google.colab import drive
drive.mount('/content/drive')

import pandas as pd
import json

with open('/content/drive/MyDrive/JT Final-Final Codebook_7.31 (Data Viz) - Codebook.json', 'r') as file:
    df = json.load(file)
with open('/content/drive/MyDrive/Validated Coding Summery by Reference(Data Viz) - Sheet1.json', 'r') as file:
    ds = json.load(file)

#function to return parent code
def parent_code(code_name):
    if "\\" in code_name:
        section = code_name.split("\\")
        parent = "\\".join(section[:-1])
        return parent
    else:
        return None

#function to build a dictionary
def build_parent_child_dict(data):
    parent_child_dict = {}
    for element in data:
        parent = parent_code(element['Name'])
        if parent is not None:
            if parent not in parent_child_dict:
                parent_child_dict[parent] = []
            parent_child_dict[parent].append(element['Name'])
    return parent_child_dict

parent_child_dict = build_parent_child_dict(df)

#function to return all children code
def children_code(code_name, parent_child_dict):
    children_elements = parent_child_dict.get(code_name, [])
    return children_elements

#function to remove "Code////" for ds
def remove_code_prefix(data):
    for entry in data:
        entry["Hierarchical Name"] = entry["Hierarchical Name"].replace("Codes\\\\", "")
    return data

ds = remove_code_prefix(ds)

#function to return all occurrences
def all_occurrences(code_name, data):
    occurrences = []
    for element in data:
        if element['Hierarchical Name'] == code_name or element['Hierarchical Name'].startswith(code_name + "\\"):
            occurrences.append(element)
    return occurrences

#test
code = "Demographics\\Background"
parent = parent_code(code)
children = children_code(code, parent_child_dict)
occurrence = all_occurrences(code, ds)
print("Parent codes:", parent)
print("Children codes:", children)
print("All occurrences:", occurrence)