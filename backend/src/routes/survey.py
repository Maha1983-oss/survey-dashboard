from flask import Blueprint, request, jsonify
import pandas as pd
import os

survey_bp = Blueprint('survey_bp', __name__)

@survey_bp.route('/survey/upload', methods=['POST'])
def upload_survey():
    if 'file' not in request.files or request.files['file'].filename == '':
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    try:
        df = pd.read_excel(file)
        preview_data = df.fillna('').to_dict(orient='records')[:20]
        return jsonify({'data': preview_data}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to parse Excel file: {str(e)}'}), 500
