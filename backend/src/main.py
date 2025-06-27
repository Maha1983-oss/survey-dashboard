import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from src.routes.survey import survey_bp

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
CORS(app)

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
app.register_blueprint(survey_bp, url_prefix='/api')

@app.route('/')
def index():
    return "Survey API is running."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
