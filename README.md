# 🚀 Advanced Survey Analytics Dashboard

A comprehensive, professional-grade survey data analysis platform with advanced analytics, interactive visualizations, and modern UI/UX design.

## ✨ Features

### 📊 **Advanced Analytics**
- **Multi-variable Analysis** - Analyze up to 5 variables simultaneously
- **Statistical Summaries** - Mean, median, standard deviation, quartiles
- **Correlation Analysis** - Pearson correlation and Cramér's V for categorical data
- **Multiple Answer Questions** - Intelligent handling of MA survey questions
- **Automated Insights** - AI-powered insights and recommendations

### 📈 **Rich Visualizations**
- **Multiple Chart Types** - Pie charts, bar charts, line charts, area charts
- **Interactive Charts** - Hover effects, legends, and responsive design
- **Auto Chart Selection** - Intelligent chart type selection based on data
- **Data Tables** - Comprehensive tables with counts and percentages
- **Progress Visualizations** - Visual progress bars in data tables

### 🎨 **Modern UI/UX**
- **Professional Design** - Clean, modern interface with gradient themes
- **Responsive Layout** - Optimized for desktop, tablet, and mobile
- **Dark/Light Themes** - Automatic theme adaptation
- **Interactive Components** - Smooth animations and transitions
- **Accessibility** - WCAG compliant design

### 🔧 **Advanced Features**
- **Data Preview** - Instant preview of uploaded data
- **Variable Search** - Quick search through available variables
- **Export Options** - Export results in multiple formats
- **Real-time Processing** - Live progress indicators
- **Data Quality Checks** - Missing data analysis and validation

### 🔒 **Security & Performance**
- **Password Protection** - Secure dashboard access
- **Data Validation** - Comprehensive input validation
- **Error Handling** - Graceful error management
- **Performance Optimized** - Fast loading and processing

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Recharts** - Powerful charting library
- **Lucide Icons** - Beautiful icon library

### **Backend**
- **Flask** - Python web framework
- **Pandas** - Data manipulation and analysis
- **NumPy** - Numerical computing
- **SciPy** - Statistical analysis
- **Openpyxl** - Excel file processing
- **Gunicorn** - WSGI HTTP server

## 📋 **Requirements**

### **System Requirements**
- Python 3.11+
- Node.js 18+
- 2GB RAM minimum
- Modern web browser

### **Python Dependencies**
```
Flask==3.1.1
pandas==2.3.0
numpy==2.3.0
scipy==1.14.1
openpyxl==3.1.5
gunicorn==23.0.0
flask-cors==6.0.0
scikit-learn==1.5.2
```

## 🚀 **Deployment**

### **Render Deployment (Recommended)**

1. **Upload to GitHub**
   ```bash
   # Upload all files to your GitHub repository
   ```

2. **Render Configuration**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT src.main:app`
   - **Environment**: Python 3.11

3. **Environment Variables**
   - No additional environment variables required
   - Password is hardcoded as `survey2025` (can be changed in code)

### **Local Development**

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Development Server**
   ```bash
   python src/main.py
   ```

3. **Access Dashboard**
   - Open `http://localhost:5000`
   - Password: `survey2025`

## 📖 **Usage Guide**

### **1. Login**
- Enter password: `survey2025`
- Click "Access Dashboard"

### **2. Upload Data**
- Click "Choose Excel File"
- Select your survey data file (.xlsx or .xls)
- View data preview and column information

### **3. Select Variables**
- Browse available variables
- Use search to find specific variables
- Select up to 5 variables for analysis
- View selection summary

### **4. Generate Analysis**
- Click "Generate Advanced Analysis"
- View progress indicator
- Explore results in multiple tabs

### **5. Analyze Results**
- **Charts Tab**: Interactive visualizations
- **Data Table Tab**: Detailed statistics
- **Insights Tab**: Automated insights and recommendations

## 📊 **Data Format Requirements**

### **Excel File Structure**
- First row should contain column headers
- Each row represents one survey response
- No completely empty rows or columns
- Supported formats: .xlsx, .xls

### **Multiple Answer Questions**
- Use format: `Question MA`, `Question MA.1`, `Question MA.2`
- System automatically combines related MA columns
- Provides comprehensive MA analysis

### **Data Types Supported**
- **Categorical**: Text responses, multiple choice
- **Numerical**: Ratings, scores, counts
- **Mixed**: Combination of text and numbers

## 🔧 **Configuration**

### **Password Change**
Edit `src/App.jsx`:
```javascript
const DASHBOARD_PASSWORD = 'your_new_password'
```

### **Upload Limits**
Edit `src/main.py`:
```python
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
```

### **Chart Colors**
Edit `src/App.jsx`:
```javascript
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', ...]
```

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Blank Page After Login**
   - Clear browser cache
   - Check browser console for errors
   - Verify file upload completed successfully

2. **File Upload Fails**
   - Check file format (.xlsx or .xls only)
   - Verify file size (max 16MB)
   - Ensure file contains data

3. **Variables Not Showing**
   - Verify Excel file has column headers
   - Check for empty columns
   - Refresh page and re-upload

4. **Charts Not Displaying**
   - Check if variables have data
   - Verify browser supports modern JavaScript
   - Clear browser cache

### **Error Messages**
- **"No data available"**: Variable contains no valid responses
- **"Analysis failed"**: Data format issue or processing error
- **"File upload failed"**: File format or size issue

## 📈 **Performance Tips**

1. **File Size**: Keep Excel files under 10MB for optimal performance
2. **Variables**: Limit analysis to 5 variables at once
3. **Browser**: Use modern browsers (Chrome, Firefox, Safari, Edge)
4. **Data**: Clean data before upload for better results

## 🔄 **Updates & Maintenance**

### **Updating the Dashboard**
1. Replace files in GitHub repository
2. Render automatically redeploys
3. Clear browser cache after updates

### **Data Backup**
- Uploaded files are temporarily stored
- Export results before clearing data
- Keep original Excel files as backup

## 📞 **Support**

### **Technical Issues**
- Check browser console for error messages
- Verify file format and data structure
- Clear browser cache and cookies

### **Feature Requests**
- Document specific requirements
- Provide sample data if possible
- Consider impact on existing functionality

## 📄 **License**

This dashboard is provided as-is for survey data analysis purposes. Modify and distribute according to your organization's requirements.

---

**Version**: 2.0.0 Enhanced  
**Last Updated**: December 2024  
**Compatibility**: Modern browsers, Python 3.11+, Excel 2016+

