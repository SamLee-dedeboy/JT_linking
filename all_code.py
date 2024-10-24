def only_occurrences(code_name, data):
    occurrences = []
    for element in data:
        if element['Hierarchical Name'] == code_name:
            occurrences.append(element)
    return occurrences

all_codes = []
for element in df:
    code_name = element['Name']
    children = children_code(code_name, parent_child_dict)
    occurrences = only_occurrences(code_name, ds)
    all_codes.append({
        "Code Name": code_name,
        "Children": children,
        "Occurrences": occurrences
    })
output_file = '/content/drive/MyDrive/all_codes3.json'
with open(output_file, 'w') as json_file:
    json.dump(all_codes, json_file, indent=4)