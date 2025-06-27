# Survey Dashboard (Redesigned)

Modern full-stack survey dashboard with Excel upload, React frontend, Flask backend.

## Deploy Instructions

### Render (Backend):
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn --chdir src main:app`

### Netlify (Frontend):
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`

## Features

- Tailwind CSS + Vite
- Drag-and-drop Excel upload
- Fast preview of survey results
