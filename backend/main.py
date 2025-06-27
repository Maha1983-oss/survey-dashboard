from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

@app.route("/api/survey/upload", methods=["POST"])
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join("/tmp", filename)
    file.save(filepath)

    try:
        df = pd.read_excel(filepath)
        processed = process_survey_data(df)
        return jsonify({"data": processed}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def process_survey_data(df):
    base_cols = df.columns[:3].tolist()  # UID, Gender, Age
    question_cols = df.columns[3:]

    grouped = {}
    single_cols = []

    for col in question_cols:
        label = col.strip()
        if "[MA]" in label or "MA" in label:
            # Strip .1, .2 suffixes and normalize
            key = label.split(" MA")[0].split("[MA]")[0].strip()
            grouped.setdefault(key, []).append(col)
        else:
            single_cols.append(col)

    result = []
    for _, row in df.iterrows():
        entry = {col: row[col] for col in base_cols if col in df.columns}

        for col in single_cols:
            entry[col.strip()] = row[col]

        for key, cols in grouped.items():
            responses = list(filter(lambda x: pd.notna(x), [row[c] for c in cols if c in df.columns]))
            entry[key + " [MA]"] = list(set(responses))

        result.append(entry)

    return result

if __name__ == "__main__":
    app.run(debug=True)
