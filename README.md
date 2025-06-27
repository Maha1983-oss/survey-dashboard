# Survey Data Dashboard - Phase 1 Update

A web-based dashboard for analyzing survey data with interactive charts and correlation analysis.

## New Features in Phase 1:
- **Clear Data & Upload New File**: Added ability to clear current data and upload a new Excel file without refreshing the page
- **Enhanced File Management**: Better handling of file uploads and data state management
- **Improved User Experience**: Clear visual feedback when clearing data

## Features:
- **Password Protection**: Secure access with configurable password
- **Excel File Upload**: Support for .xlsx and .xls files
- **Smart Question Grouping**: Automatically handles Single Answer (SA) and Multiple Answer (MA) questions
- **Interactive Charts**: 
  - Pie charts for single variable analysis
  - Grouped bar charts for correlation analysis between two variables
- **Variable Selection**: Choose 1-5 variables for comprehensive analysis
- **Responsive Design**: Works on desktop and mobile devices

## How to Use:
1. Enter password: `survey2025`
2. Upload your Excel file containing survey data
3. Select variables from the list (1-5 variables)
4. Click "Generate Analysis" to view charts
5. Use "Clear Data & Upload New File" to analyze different datasets

## Technical Details:
- **Frontend**: React with shadcn/ui components and Recharts for visualization
- **Backend**: Flask with pandas for data processing
- **Deployment**: Optimized for Render deployment

## Password:
Default password is `survey2025` (can be changed in the code)

## Data Format:
- Each row represents a unique survey respondent
- Columns represent survey questions and responses
- SA (Single Answer) questions: One response per respondent
- MA (Multiple Answer) questions: Multiple responses spread across related columns (e.g., Question MA, Question MA.1, Question MA.2)

