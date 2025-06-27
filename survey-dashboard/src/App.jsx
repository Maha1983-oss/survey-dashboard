import { useState, useEffect } from 'react'
import { Upload, BarChart3, PieChart, FileSpreadsheet, Lock, TrendingUp, RefreshCcw, Table } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  PieChart as RechartsPieChart, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import './App.css'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']
const DASHBOARD_PASSWORD = 'survey2025' // You can change this password

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === DASHBOARD_PASSWORD) {
      localStorage.setItem('dashboard_authenticated', 'true')
      onLogin()
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Lock className="h-6 w-6" />
            Survey Dashboard Access
          </CardTitle>
          <CardDescription>
            Please enter the password to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter dashboard password"
                className="mt-1"
                autoFocus
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <Button type="submit" className="w-full">
              Access Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function Dashboard() {
  const [file, setFile] = useState(null)
  const [columns, setColumns] = useState([])
  const [selectedVariables, setSelectedVariables] = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('dashboard_authenticated')
    window.location.reload()
  }

  const handleClearData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/clear_data', {
        method: 'POST',
      })
      if (response.ok) {
        setFile(null)
        setColumns([])
        setSelectedVariables([])
        setChartData(null)
        alert('Data cleared successfully. You can now upload a new file.')
      } else {
        console.error('Failed to clear data')
        alert('Failed to clear data. Please try again.')
      }
    } catch (error) {
      console.error('Error clearing data:', error)
      alert('Error clearing data. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setLoading(true)

    // Create FormData to send file to backend
    const formData = new FormData()
    formData.append('file', uploadedFile)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        setColumns(data.columns)
        setSelectedVariables([]) // Reset selected variables
        setChartData(null) // Reset chart data
      } else {
        console.error('Failed to upload file')
        alert('Failed to upload file. Please try again.')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleVariableSelect = (variable) => {
    if (selectedVariables.includes(variable)) {
      setSelectedVariables(selectedVariables.filter(v => v !== variable))
    } else if (selectedVariables.length < 5) { // Limit to 5 variables
      setSelectedVariables([...selectedVariables, variable])
    }
  }

  const generateChart = async () => {
    if (selectedVariables.length < 1) {
      alert('Please select at least 1 variable for analysis')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables: selectedVariables
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data) // Debug log
        setChartData(data)
      } else {
        console.error('Failed to generate chart')
        alert('Failed to generate chart. Please try again.')
      }
    } catch (error) {
      console.error('Error generating chart:', error)
      alert('Error generating chart. Please check if the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const renderPieChart = (variable, data) => {
    // Ensure data exists and is an array
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div className="text-center text-gray-500 py-8">No data available for chart</div>
    }

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderGroupedBarChart = (variable, data) => {
    // Ensure data exists and is an array
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <div className="text-center text-gray-500 py-8">No data available for chart</div>
    }

    // Group data by category for grouped bar chart
    const groupedData = {}
    data.forEach(item => {
      if (!groupedData[item.category]) {
        groupedData[item.category] = { category: item.category }
      }
      groupedData[item.category][item.subcategory] = item.value
    })

    const chartData = Object.values(groupedData)
    const subcategories = [...new Set(data.map(item => item.subcategory))]

    return (
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            {subcategories.map((subcategory, index) => (
              <Bar 
                key={subcategory}
                dataKey={subcategory} 
                fill={COLORS[index % COLORS.length]}
                name={subcategory}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderDataTable = (tableData) => {
    if (!tableData) return <div className="text-center text-gray-500 py-8">No table data available</div>

    // Handle single variable table
    if (tableData.question) {
      return (
        <div className="overflow-x-auto">
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              {tableData.question.length > 60 ? `${tableData.question.substring(0, 60)}...` : tableData.question}
            </h4>
            <p className="text-sm text-gray-600">Total Responses: {tableData.total_responses}</p>
          </div>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Response
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Count
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData.data && tableData.data.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {row.response}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.count}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    // Handle correlation table
    if (tableData.var1 && tableData.var2) {
      return (
        <div className="overflow-x-auto">
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              Correlation Analysis: {tableData.var1} vs {tableData.var2}
            </h4>
          </div>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  {tableData.var1.length > 20 ? `${tableData.var1.substring(0, 20)}...` : tableData.var1}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  {tableData.var2.length > 20 ? `${tableData.var2.substring(0, 20)}...` : tableData.var2}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Count
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData.data && tableData.data.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {row.var1_response}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {row.var2_response}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.count}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {row.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return <div className="text-center text-gray-500 py-8">No table data available</div>
  }

  const renderAnalysis = (variable, result) => {
    if (!result) return null

    const isCorrelation = result.type === 'correlation'
    const chartIcon = isCorrelation ? <TrendingUp className="h-5 w-5" /> : <PieChart className="h-5 w-5" />
    
    // Get chart data - handle both old and new API response formats
    const chartData = result.chart_data || result.data || []
    const tableData = result.table_data || null
    
    return (
      <div key={variable} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {chartIcon}
          <h3 className="text-lg font-semibold text-gray-800">
            {variable.length > 60 ? `${variable.substring(0, 60)}...` : variable}
          </h3>
        </div>
        
        {isCorrelation && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Correlation Analysis:</strong> This shows the relationship between the two selected variables. 
              The chart displays frequency of combinations, while the table provides detailed counts and percentages.
            </p>
          </div>
        )}
        
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Chart View
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Table View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="mt-4">
            <div className="bg-white p-4 rounded-lg border">
              {result.chart_type === 'pie' && renderPieChart(variable, chartData)}
              {result.chart_type === 'grouped_bar' && renderGroupedBarChart(variable, chartData)}
            </div>
          </TabsContent>
          
          <TabsContent value="table" className="mt-4">
            <div className="bg-white p-4 rounded-lg border">
              {renderDataTable(tableData)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  const getAnalysisDescription = () => {
    if (selectedVariables.length === 0) return ''
    if (selectedVariables.length === 1) return 'Single variable analysis'
    if (selectedVariables.length === 2) return 'Two-variable correlation analysis'
    return 'Multi-variable analysis'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-4xl font-bold text-gray-900">Survey Data Dashboard</h1>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Logout
            </Button>
          </div>
          <p className="text-lg text-gray-600">Upload your Excel file and analyze survey responses with interactive charts and detailed tables</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File
              </CardTitle>
              <CardDescription>
                Upload your Excel file containing survey responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Choose Excel File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="mt-1"
                    disabled={loading}
                  />
                </div>
                {file && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <FileSpreadsheet className="h-4 w-4" />
                    {file.name}
                  </div>
                )}
                {loading && (
                  <div className="text-sm text-blue-600">
                    Processing file...
                  </div>
                )}
                {file && (
                  <Button
                    onClick={handleClearData}
                    disabled={loading}
                    className="w-full mt-4 flex items-center gap-2"
                    variant="outline"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Clear Data & Upload New File
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Variable Selection Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Select Variables
              </CardTitle>
              <CardDescription>
                Choose 1-5 variables for analysis. Select 2 variables for correlation analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {columns.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {columns.map((column, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedVariables.includes(column)
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => handleVariableSelect(column)}
                      >
                        <div className="text-sm font-medium truncate" title={column}>
                          {column}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedVariables.length > 0 && (
                    <div className="mt-4">
                      <Label>Selected Variables ({selectedVariables.length}/5): {getAnalysisDescription()}</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedVariables.map((variable, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full"
                          >
                            {variable.length > 30 ? `${variable.substring(0, 30)}...` : variable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={generateChart}
                    disabled={selectedVariables.length < 1 || loading}
                    className="w-full mt-4"
                  >
                    {loading ? 'Generating...' : 'Generate Analysis'}
                  </Button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {loading ? 'Processing file...' : 'Upload an Excel file to see available variables'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results Section */}
        {chartData && chartData.results && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                {selectedVariables.length === 2 ? 
                  'Individual analysis and correlation analysis of selected variables. Switch between chart and table views.' :
                  'Analysis of selected variables. Switch between chart and table views for detailed insights.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Object.entries(chartData.results).map(([variable, result]) => 
                  renderAnalysis(variable, result)
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = localStorage.getItem('dashboard_authenticated')
    if (authenticated === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return <Dashboard />
}

export default App

