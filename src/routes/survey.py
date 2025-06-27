import os
import pandas as pd
import numpy as np
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import json
from datetime import datetime
import re
from collections import Counter
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

survey_bp = Blueprint('survey', __name__)

ALLOWED_EXTENSIONS = {'xlsx', 'xls'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def clean_data(df):
    """Enhanced data cleaning with comprehensive preprocessing"""
    # Remove completely empty rows and columns
    df = df.dropna(how='all').dropna(axis=1, how='all')
    
    # Clean column names
    df.columns = df.columns.astype(str)
    df.columns = [col.strip() for col in df.columns]
    
    # Handle unnamed columns
    for i, col in enumerate(df.columns):
        if col.startswith('Unnamed:') or col == 'nan':
            df.columns.values[i] = f'Column_{i+1}'
    
    return df

def detect_data_types(df):
    """Advanced data type detection and categorization"""
    column_info = {}
    
    for col in df.columns:
        series = df[col].dropna()
        if len(series) == 0:
            column_info[col] = {'type': 'empty', 'unique_count': 0, 'sample_values': []}
            continue
            
        unique_count = series.nunique()
        sample_values = series.head(5).tolist()
        
        # Detect numeric data
        try:
            pd.to_numeric(series, errors='raise')
            if unique_count > 10:
                column_info[col] = {'type': 'continuous', 'unique_count': unique_count, 'sample_values': sample_values}
            else:
                column_info[col] = {'type': 'discrete_numeric', 'unique_count': unique_count, 'sample_values': sample_values}
        except:
            # Detect categorical data
            if unique_count <= 20:
                column_info[col] = {'type': 'categorical', 'unique_count': unique_count, 'sample_values': sample_values}
            else:
                column_info[col] = {'type': 'text', 'unique_count': unique_count, 'sample_values': sample_values}
    
    return column_info

def generate_statistical_summary(df, column):
    """Generate comprehensive statistical summary"""
    series = df[column].dropna()
    
    summary = {
        'total_responses': len(df),
        'valid_responses': len(series),
        'missing_responses': len(df) - len(series),
        'missing_percentage': round(((len(df) - len(series)) / len(df)) * 100, 2) if len(df) > 0 else 0
    }
    
    # Try numeric analysis
    try:
        numeric_series = pd.to_numeric(series, errors='raise')
        summary.update({
            'mean': round(numeric_series.mean(), 2),
            'median': round(numeric_series.median(), 2),
            'std_dev': round(numeric_series.std(), 2),
            'min_value': numeric_series.min(),
            'max_value': numeric_series.max(),
            'q1': round(numeric_series.quantile(0.25), 2),
            'q3': round(numeric_series.quantile(0.75), 2)
        })
    except:
        # Categorical analysis
        value_counts = series.value_counts()
        summary.update({
            'unique_values': len(value_counts),
            'most_common': value_counts.index[0] if len(value_counts) > 0 else None,
            'most_common_count': value_counts.iloc[0] if len(value_counts) > 0 else 0,
            'least_common': value_counts.index[-1] if len(value_counts) > 0 else None,
            'least_common_count': value_counts.iloc[-1] if len(value_counts) > 0 else 0
        })
    
    return summary

def process_multiple_answer_questions(df, column):
    """Enhanced processing for multiple answer questions"""
    # Check if this is part of a multiple answer series
    base_name = re.sub(r'\.?\d+$', '', column)
    related_columns = [col for col in df.columns if col.startswith(base_name) and col != column]
    
    if related_columns:
        # Combine all related MA columns
        all_ma_columns = [column] + related_columns
        combined_responses = []
        
        for col in all_ma_columns:
            responses = df[col].dropna().tolist()
            combined_responses.extend(responses)
        
        # Count all responses
        response_counts = Counter(combined_responses)
        total_responses = len(combined_responses)
        
        return {
            'is_multiple_answer': True,
            'related_columns': all_ma_columns,
            'combined_counts': response_counts,
            'total_responses': total_responses
        }
    
    return {'is_multiple_answer': False}

def generate_advanced_chart_data(df, column, chart_type='auto'):
    """Generate data for multiple chart types with enhanced analytics"""
    series = df[column].dropna()
    
    if len(series) == 0:
        return []
    
    # Handle multiple answer questions
    ma_info = process_multiple_answer_questions(df, column)
    
    if ma_info['is_multiple_answer']:
        # Use combined MA data
        value_counts = ma_info['combined_counts']
        total = ma_info['total_responses']
    else:
        # Regular single-answer processing
        value_counts = series.value_counts()
        total = len(series)
    
    # Convert to chart data format
    chart_data = []
    for value, count in value_counts.items():
        if pd.isna(value) or value == '':
            continue
            
        percentage = round((count / total) * 100, 1) if total > 0 else 0
        chart_data.append({
            'name': str(value)[:50],  # Truncate long labels
            'value': count,
            'percentage': percentage,
            'color': None  # Will be assigned by frontend
        })
    
    # Sort by count (descending)
    chart_data.sort(key=lambda x: x['value'], reverse=True)
    
    # Limit to top 15 items for readability
    if len(chart_data) > 15:
        others_count = sum(item['value'] for item in chart_data[15:])
        others_percentage = round((others_count / total) * 100, 1) if total > 0 else 0
        chart_data = chart_data[:15]
        if others_count > 0:
            chart_data.append({
                'name': 'Others',
                'value': others_count,
                'percentage': others_percentage,
                'color': '#cccccc'
            })
    
    return chart_data

def generate_table_data(df, column):
    """Generate comprehensive table data with enhanced statistics"""
    series = df[column].dropna()
    
    if len(series) == 0:
        return None
    
    # Handle multiple answer questions
    ma_info = process_multiple_answer_questions(df, column)
    
    if ma_info['is_multiple_answer']:
        value_counts = ma_info['combined_counts']
        total = ma_info['total_responses']
        question_title = f"{column} (Multiple Answer - Combined)"
    else:
        value_counts = series.value_counts()
        total = len(series)
        question_title = column
    
    # Generate table rows
    table_rows = []
    for value, count in value_counts.items():
        if pd.isna(value) or value == '':
            continue
            
        percentage = round((count / total) * 100, 2) if total > 0 else 0
        table_rows.append({
            'response': str(value),
            'count': count,
            'percentage': f"{percentage}%",
            'raw_percentage': percentage
        })
    
    # Sort by count (descending)
    table_rows.sort(key=lambda x: x['count'], reverse=True)
    
    return {
        'question': question_title,
        'total_responses': total,
        'unique_responses': len(value_counts),
        'data': table_rows,
        'statistics': generate_statistical_summary(df, column)
    }

def generate_correlation_analysis(df, variables):
    """Generate correlation analysis for multiple variables"""
    if len(variables) < 2:
        return None
    
    correlation_data = []
    
    for i, var1 in enumerate(variables):
        for j, var2 in enumerate(variables[i+1:], i+1):
            try:
                # Get clean data for both variables
                series1 = df[var1].dropna()
                series2 = df[var2].dropna()
                
                # Find common indices
                common_idx = series1.index.intersection(series2.index)
                if len(common_idx) < 10:  # Need at least 10 data points
                    continue
                
                s1_common = series1.loc[common_idx]
                s2_common = series2.loc[common_idx]
                
                # Try numeric correlation
                try:
                    s1_numeric = pd.to_numeric(s1_common, errors='raise')
                    s2_numeric = pd.to_numeric(s2_common, errors='raise')
                    
                    correlation_coef = s1_numeric.corr(s2_numeric)
                    correlation_data.append({
                        'variable1': var1,
                        'variable2': var2,
                        'correlation': round(correlation_coef, 3),
                        'type': 'pearson',
                        'sample_size': len(common_idx)
                    })
                except:
                    # Categorical correlation (Cramér's V)
                    try:
                        contingency_table = pd.crosstab(s1_common, s2_common)
                        chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
                        n = contingency_table.sum().sum()
                        cramers_v = np.sqrt(chi2 / (n * (min(contingency_table.shape) - 1)))
                        
                        correlation_data.append({
                            'variable1': var1,
                            'variable2': var2,
                            'correlation': round(cramers_v, 3),
                            'type': 'cramers_v',
                            'p_value': round(p_value, 3),
                            'sample_size': n
                        })
                    except:
                        continue
            except:
                continue
    
    return correlation_data

def generate_insights(df, column, chart_data, table_data):
    """Generate automated insights and recommendations"""
    insights = []
    
    if not chart_data or len(chart_data) == 0:
        return insights
    
    # Response distribution insights
    total_responses = sum(item['value'] for item in chart_data)
    top_response = chart_data[0] if chart_data else None
    
    if top_response:
        insights.append({
            'type': 'distribution',
            'title': 'Top Response',
            'description': f"'{top_response['name']}' is the most common response with {top_response['value']} responses ({top_response['percentage']}%)",
            'importance': 'high' if top_response['percentage'] > 50 else 'medium'
        })
    
    # Diversity insights
    unique_responses = len(chart_data)
    if unique_responses > 10:
        insights.append({
            'type': 'diversity',
            'title': 'High Response Diversity',
            'description': f"This question has {unique_responses} unique responses, indicating high diversity in answers",
            'importance': 'medium'
        })
    elif unique_responses <= 3:
        insights.append({
            'type': 'diversity',
            'title': 'Low Response Diversity',
            'description': f"This question has only {unique_responses} unique responses, showing concentrated opinions",
            'importance': 'medium'
        })
    
    # Concentration insights
    top_3_percentage = sum(item['percentage'] for item in chart_data[:3])
    if top_3_percentage > 80:
        insights.append({
            'type': 'concentration',
            'title': 'Highly Concentrated Responses',
            'description': f"Top 3 responses account for {top_3_percentage:.1f}% of all answers",
            'importance': 'high'
        })
    
    # Missing data insights
    if table_data and 'statistics' in table_data:
        missing_pct = table_data['statistics'].get('missing_percentage', 0)
        if missing_pct > 20:
            insights.append({
                'type': 'data_quality',
                'title': 'High Missing Data',
                'description': f"{missing_pct}% of responses are missing for this question",
                'importance': 'high'
            })
        elif missing_pct > 10:
            insights.append({
                'type': 'data_quality',
                'title': 'Moderate Missing Data',
                'description': f"{missing_pct}% of responses are missing for this question",
                'importance': 'medium'
            })
    
    return insights

@survey_bp.route('/api/upload', methods=['POST'])
def upload_file():
    """Enhanced file upload with comprehensive data preview"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload Excel files only.'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Read and process file
        try:
            df = pd.read_excel(filepath)
        except Exception as e:
            return jsonify({'error': f'Error reading Excel file: {str(e)}'}), 400
        
        # Clean and process data
        df = clean_data(df)
        
        if df.empty:
            return jsonify({'error': 'The uploaded file contains no data'}), 400
        
        # Store filename in session or app context
        current_app.config['CURRENT_FILE'] = filepath
        
        # Generate data preview
        column_info = detect_data_types(df)
        
        preview_data = {
            'rows': len(df),
            'columns': len(df.columns),
            'sample_data': df.head(3).to_dict('records'),
            'column_info': column_info,
            'file_info': {
                'name': file.filename,
                'size': os.path.getsize(filepath),
                'upload_time': datetime.now().isoformat()
            }
        }
        
        return jsonify({
            'message': 'File uploaded successfully',
            'columns': df.columns.tolist(),
            'preview': preview_data
        })
        
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@survey_bp.route('/api/analyze', methods=['POST'])
def analyze_data():
    """Enhanced analysis with comprehensive analytics and insights"""
    try:
        data = request.get_json()
        variables = data.get('variables', [])
        chart_type = data.get('chart_type', 'auto')
        
        if not variables:
            return jsonify({'error': 'No variables selected'}), 400
        
        # Get current file
        filepath = current_app.config.get('CURRENT_FILE')
        if not filepath or not os.path.exists(filepath):
            return jsonify({'error': 'No data file found. Please upload a file first.'}), 400
        
        # Read data
        df = pd.read_excel(filepath)
        df = clean_data(df)
        
        # Validate variables exist
        missing_vars = [var for var in variables if var not in df.columns]
        if missing_vars:
            return jsonify({'error': f'Variables not found: {missing_vars}'}), 400
        
        results = {}
        
        # Process each variable
        for variable in variables:
            try:
                # Generate chart data
                chart_data = generate_advanced_chart_data(df, variable, chart_type)
                
                # Generate table data
                table_data = generate_table_data(df, variable)
                
                # Generate insights
                insights = generate_insights(df, variable, chart_data, table_data)
                
                # Determine best chart type
                if chart_type == 'auto':
                    unique_count = len(chart_data)
                    if unique_count <= 8:
                        best_chart_type = 'pie'
                    elif unique_count <= 15:
                        best_chart_type = 'bar'
                    else:
                        best_chart_type = 'bar'
                else:
                    best_chart_type = chart_type
                
                results[variable] = {
                    'chart_data': chart_data,
                    'table_data': table_data,
                    'chart_type': best_chart_type,
                    'insights': insights,
                    'statistics': table_data['statistics'] if table_data else None,
                    'type': 'single_variable'
                }
                
            except Exception as e:
                results[variable] = {
                    'error': f'Analysis failed for {variable}: {str(e)}',
                    'chart_data': [],
                    'table_data': None,
                    'type': 'error'
                }
        
        # Generate correlation analysis if multiple variables
        correlation_data = None
        if len(variables) >= 2:
            try:
                correlation_data = generate_correlation_analysis(df, variables)
            except Exception as e:
                print(f"Correlation analysis failed: {e}")
        
        response_data = {
            'results': results,
            'correlation': correlation_data,
            'summary': {
                'total_variables': len(variables),
                'successful_analyses': len([r for r in results.values() if 'error' not in r]),
                'total_responses': len(df),
                'analysis_timestamp': datetime.now().isoformat()
            }
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@survey_bp.route('/api/clear_data', methods=['POST'])
def clear_data():
    """Clear uploaded data and reset session"""
    try:
        # Remove current file reference
        if 'CURRENT_FILE' in current_app.config:
            filepath = current_app.config['CURRENT_FILE']
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except:
                    pass  # File might be in use
            del current_app.config['CURRENT_FILE']
        
        return jsonify({'message': 'Data cleared successfully'})
        
    except Exception as e:
        return jsonify({'error': f'Failed to clear data: {str(e)}'}), 500

@survey_bp.route('/api/export', methods=['POST'])
def export_results():
    """Export analysis results in various formats"""
    try:
        data = request.get_json()
        export_format = data.get('format', 'json')
        results = data.get('results', {})
        
        if export_format == 'json':
            return jsonify(results)
        elif export_format == 'csv':
            # Convert results to CSV format
            # Implementation would depend on specific requirements
            return jsonify({'message': 'CSV export not yet implemented'}), 501
        else:
            return jsonify({'error': 'Unsupported export format'}), 400
            
    except Exception as e:
        return jsonify({'error': f'Export failed: {str(e)}'}), 500

