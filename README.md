# Survey Data Dashboard

A web-based dashboard for analyzing survey data with interactive charts and cross-referencing capabilities.

## Features

- **Password Protection**: Secure access with password authentication
- **File Upload**: Upload Excel files (.xlsx, .xls) containing survey data
- **Smart Question Handling**: Automatically detects Single Answer (SA) and Multiple Answer (MA) questions
- **Interactive Charts**: 
  - Pie charts for single variable analysis
  - Grouped bar charts for correlation analysis between two variables
- **Data Integrity**: Preserves all respondent data with unique ID assignment
- **Cross-Reference Analysis**: Select multiple variables for comprehensive analysis

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: React with shadcn/ui components
- **Charts**: Recharts library
- **Data Processing**: pandas, numpy, openpyxl

## Deployment

This application is configured for deployment on Render with:
- Automatic dependency installation
- Production-ready Gunicorn server
- CORS enabled for frontend-backend communication

## Usage

1. Access the dashboard URL
2. Enter the password: `survey2025`
3. Upload your Excel survey data file
4. Select variables for analysis
5. Generate interactive charts and insights

## Data Format

The dashboard expects Excel files with:
- Each row representing a unique survey respondent
- Column headers as survey questions
- SA (Single Answer) questions for single-choice responses
- MA (Multiple Answer) questions for multiple-choice responses (split across columns)

## Security

- Password-protected access
- HTTPS encryption (when deployed)
- No data persistence (files processed in memory)

