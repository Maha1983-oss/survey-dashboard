# Survey Dashboard (Redesigned)

This is a modern full-stack survey dashboard that allows users to upload Excel files and view structured survey data in a beautiful frontend interface.

## 🚀 Features

- 📤 Drag-and-drop Excel file upload
- 📊 Live preview of parsed data
- 🧾 Backend processing with Flask and pandas
- 💅 Styled with Tailwind CSS (React frontend)

## 🗂 Project Structure

```
/frontend
  └── React + Tailwind frontend
/backend
  └── Flask backend API (entry: src/main.py)
```

## 🧰 Setup Instructions

### 1. Backend (Python)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
gunicorn --chdir src main:app
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment Notes

- Backend: Use `gunicorn --chdir src main:app` as the Render start command
- Frontend: Deploy on Vercel/Netlify using React build
