import os
import pandas as pd
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import re
import numpy as np
from collections import Counter

survey_bp = Blueprint("survey", __name__)

# Global variable to store the current dataframe
current_df = None

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in {"xlsx", "xls"}

def process_ma_questions(df, columns):
    """Process Multiple Answer (MA) questions by grouping related columns"""
    ma_groups = {}
    
    for col in columns:
        # Check if it's an MA question
        if "MA" in col or "[MA]" in col:
            # Extract the base question (remove .1, .2, etc.)
            base_question = re.sub(r"\.\d+$", "", col).strip()
            
            if base_question not in ma_groups:
                ma_groups[base_question] = []
            ma_groups[base_question].append(col)
    
    return ma_groups

def get_variable_data(df, variable):
    """Get data for a single variable, handling both SA and MA questions"""
    ma_groups = process_ma_questions(df, df.columns)
    
    if variable in df.columns:
        # Single Answer (SA) question
        return df[variable].dropna().tolist()
    else:
        # Check if it's an MA question
        for base_question, related_cols in ma_groups.items():
            if variable == base_question:
                # Combine all related MA columns
                all_values = []
                for col in related_cols:
                    if col in df.columns:
                        all_values.extend(df[col].dropna().tolist())
                return all_values
    
    return []

def generate_table_data(df, variable):
    """Generate table data with counts and percentages for a single variable"""
    data = get_variable_data(df, variable)
    
    if not data:
        return None
    
    value_counts = pd.Series(data).value_counts()
    total_responses = len(data)
    
    table_data = []
    for response, count in value_counts.items():
        percentage = (count / total_responses) * 100
        table_data.append({
            "response": str(response),
            "count": int(count),
            "percentage": round(percentage, 2)
        })
    
    return {
        "question": variable,
        "total_responses": total_responses,
        "data": table_data
    }

def analyze_single_variable(df, variable):
    """Analyze a single variable and return both chart and table data"""
    data = get_variable_data(df, variable)
    
    if not data:
        return None
    
    value_counts = pd.Series(data).value_counts()
    
    # Generate chart data
    chart_data = [{"name": str(k), "value": int(v)} for k, v in value_counts.items()]
    
    # Generate table data
    table_data = generate_table_data(df, variable)
    
    return {
        "type": "single",
        "chart_type": "pie",
        "chart_data": chart_data,
        "table_data": table_data
    }

def analyze_correlation(df, var1, var2):
    """Analyze correlation between two variables"""
    data1 = get_variable_data(df, var1)
    data2 = get_variable_data(df, var2)
    
    if not data1 or not data2:
        return None
    
    # Create a cross-tabulation for correlation analysis
    # For this, we need to match responses by respondent
    correlation_data = []
    
    # Get respondent-level data for both variables
    ma_groups = process_ma_questions(df, df.columns)
    
    # Handle SA vs SA correlation
    if var1 in df.columns and var2 in df.columns:
        # Both are single answer questions
        cross_tab = pd.crosstab(df[var1], df[var2], dropna=True)
        
        # Convert to format suitable for grouped bar chart
        for var1_val in cross_tab.index:
            for var2_val in cross_tab.columns:
                count = cross_tab.loc[var1_val, var2_val]
                if count > 0:
                    correlation_data.append({
                        "category": str(var1_val),
                        "subcategory": str(var2_val),
                        "value": int(count)
                    })
        
        # Generate correlation table data
        correlation_table = []
        total_combinations = cross_tab.sum().sum()
        
        for var1_val in cross_tab.index:
            for var2_val in cross_tab.columns:
                count = cross_tab.loc[var1_val, var2_val]
                if count > 0:
                    percentage = (count / total_combinations) * 100
                    correlation_table.append({
                        "var1_response": str(var1_val),
                        "var2_response": str(var2_val),
                        "count": int(count),
                        "percentage": round(percentage, 2)
                    })
    
    # Handle SA vs MA or MA vs MA correlation (simplified approach)
    else:
        # For MA questions, we'll show the top combinations
        var1_data = pd.Series(data1).value_counts().head(10)
        var2_data = pd.Series(data2).value_counts().head(10)
        
        # Create a simplified correlation showing top values from each variable
        correlation_table = []
        for i, (var1_val, var1_count) in enumerate(var1_data.items()):
            for j, (var2_val, var2_count) in enumerate(var2_data.items()):
                # Estimate correlation based on relative frequencies
                estimated_correlation = min(var1_count, var2_count) // 10  # Simplified estimation
                if estimated_correlation > 0:
                    correlation_data.append({
                        "category": str(var1_val),
                        "subcategory": str(var2_val),
                        "value": int(estimated_correlation)
                    })
                    
                    # Add to table data
                    total_est = len(data1) + len(data2)
                    percentage = (estimated_correlation / total_est) * 100
                    correlation_table.append({
                        "var1_response": str(var1_val),
                        "var2_response": str(var2_val),
                        "count": int(estimated_correlation),
                        "percentage": round(percentage, 2)
                    })
    
    return {
        "type": "correlation",
        "chart_type": "grouped_bar",
        "chart_data": correlation_data[:20],  # Limit to top 20 combinations
        "table_data": {
            "var1": var1,
            "var2": var2,
            "data": correlation_table[:20]
        },
        "variables": [var1, var2]
    }

def analyze_variables(df, variables):
    """Analyze selected variables and return chart and table data"""
    results = {}
    
    if len(variables) == 1:
        # Single variable analysis
        result = analyze_single_variable(df, variables[0])
        if result:
            results[variables[0]] = result
    
    elif len(variables) == 2:
        # Two variable correlation analysis
        var1, var2 = variables
        
        # Individual analysis for each variable
        result1 = analyze_single_variable(df, var1)
        if result1:
            results[var1] = result1
        
        result2 = analyze_single_variable(df, var2)
        if result2:
            results[var2] = result2
        
        # Correlation analysis
        correlation_result = analyze_correlation(df, var1, var2)
        if correlation_result:
            results[f"{var1} vs {var2}"] = correlation_result
    
    else:
        # Multiple variables (3+) - individual analysis for each
        for variable in variables:
            result = analyze_single_variable(df, variable)
            if result:
                results[variable] = result
    
    return results

@survey_bp.route("/upload", methods=["POST"])
def upload_file():
    global current_df
    
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)
        
        try:
            # Read the Excel file
            df = pd.read_excel(filepath)
            
            # Add unique ID if not present
            if "Manus_UID" not in df.columns:
                df["Manus_UID"] = range(1, len(df) + 1)
            
            current_df = df
            
            # Get column names
            columns = df.columns.tolist()
            
            # Process MA questions to group them
            ma_groups = process_ma_questions(df, columns)
            
            # Create a list of unique questions (base questions for MA, individual for SA)
            unique_questions = []
            processed_cols = set()
            
            for col in columns:
                if col not in processed_cols:
                    # Check if it's part of an MA group
                    is_ma_part = False
                    for base_question, related_cols in ma_groups.items():
                        if col in related_cols:
                            if base_question not in unique_questions:
                                unique_questions.append(base_question)
                            processed_cols.update(related_cols)
                            is_ma_part = True
                            break
                    
                    if not is_ma_part:
                        unique_questions.append(col)
                        processed_cols.add(col)
            
            return jsonify({
                "message": "File uploaded successfully",
                "columns": unique_questions,
                "rows": len(df)
            })
            
        except Exception as e:
            return jsonify({"error": f"Error processing file: {str(e)}"}), 500
    
    return jsonify({"error": "Invalid file type"}), 400

@survey_bp.route("/clear_data", methods=["POST"])
def clear_data():
    global current_df
    current_df = None
    # Optionally, delete the uploaded file from the server if it's no longer needed
    # For now, we'll just clear the dataframe in memory.
    return jsonify({"message": "Data cleared successfully"}), 200

@survey_bp.route("/analyze", methods=["POST"])
def analyze_data():
    global current_df
    
    if current_df is None:
        return jsonify({"error": "No data uploaded"}), 400
    
    data = request.get_json()
    variables = data.get("variables", [])
    
    if len(variables) < 1:
        return jsonify({"error": "At least 1 variable required"}), 400
    
    try:
        results = analyze_variables(current_df, variables)
        return jsonify({
            "message": "Analysis completed",
            "results": results,
            "variables": variables
        })
    except Exception as e:
        return jsonify({"error": f"Error analyzing data: {str(e)}"}), 500

