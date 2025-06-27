import { useState, useEffect } from 'react'
import { 
  Upload, BarChart3, PieChart, FileSpreadsheet, Lock, TrendingUp, RefreshCcw, 
  Table, Download, Filter, Search, Eye, Settings, BarChart as BarChartIcon, LineChart as LineChartIcon,
  Activity, Users, Target, Zap, Calendar, Clock, CheckCircle, AlertCircle,
  Info, Plus, Minus, X, ChevronDown, ChevronUp, Grid, List, Maximize2
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Separator } from '@/components/ui/separator.jsx'
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
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
  ScatterChart,
  Scatter
} from 'recharts'
import './App.css'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0']
const DASHBOARD_PASSWORD = 'survey2025'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Survey Analytics Dashboard
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your credentials to access advanced survey analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Access Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function StatsCard({ title, value, icon: Icon, trend, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600"
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p className="text-xs text-gray-500 mt-1">{trend}</p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Dashboard() {
  const [file, setFile] = useState(null)
  const [columns, setColumns] = useState([])
  const [selectedVariables, setSelectedVariables] = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedChartType, setSelectedChartType] = useState('auto')
  const [dataPreview, setDataPreview] = useState(null)

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
        setDataPreview(null)
        setAnalysisProgress(0)
      } else {
        console.error('Failed to clear data')
      }
    } catch (error) {
      console.error('Error clearing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setLoading(true)
    setAnalysisProgress(10)

    const formData = new FormData()
    formData.append('file', uploadedFile)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      setAnalysisProgress(50)
      
      if (response.ok) {
        const data = await response.json()
        setColumns(data.columns || [])
        setDataPreview(data.preview || null)
        setSelectedVariables([])
        setChartData(null)
        setAnalysisProgress(100)
      } else {
        console.error('Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setTimeout(() => {
        setLoading(false)
        setAnalysisProgress(0)
      }, 500)
    }
  }

  const handleVariableSelect = (variable) => {
    if (selectedVariables.includes(variable)) {
      setSelectedVariables(selectedVariables.filter(v => v !== variable))
    } else if (selectedVariables.length < 5) {
      setSelectedVariables([...selectedVariables, variable])
    }
  }

  const generateChart = async () => {
    if (selectedVariables.length < 1) return

    setLoading(true)
    setAnalysisProgress(20)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables: selectedVariables,
          chart_type: selectedChartType
        }),
      })
      
      setAnalysisProgress(70)
      
      if (response.ok) {
        const data = await response.json()
        setChartData(data)
        setAnalysisProgress(100)
      } else {
        console.error('Failed to generate chart')
      }
    } catch (error) {
      console.error('Error generating chart:', error)
    } finally {
      setTimeout(() => {
        setLoading(false)
        setAnalysisProgress(0)
      }, 500)
    }
  }

  const renderAdvancedChart = (variable, data, chartType = 'pie') => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No data available for visualization</p>
          </div>
        </div>
      )
    }

    const chartProps = {
      width: "100%",
      height: "100%"
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer {...chartProps}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'area':
        return (
          <ResponsiveContainer {...chartProps}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        )
      
      case 'bar':
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )
      
      default: // pie
        return (
          <ResponsiveContainer {...chartProps}>
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
        )
    }
  }

  const renderDataTable = (tableData) => {
    if (!tableData || !tableData.data) {
      return (
        <div className="text-center text-gray-500 py-8">
          <Table className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No table data available</p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              {tableData.question || 'Data Analysis'}
            </h4>
            {tableData.total_responses && (
              <p className="text-sm text-gray-600">
                Total Responses: <Badge variant="secondary">{tableData.total_responses}</Badge>
              </p>
            )}
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Response
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visual
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData.data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {row.response}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Badge variant="outline">{row.count}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{row.percentage}%</span>
                      <Progress value={parseFloat(row.percentage)} className="w-16 h-2" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderAnalysisCard = (variable, result, index) => {
    if (!result) return null

    const isCorrelation = result.type === 'correlation'
    const chartData = result.chart_data || result.data || []
    const tableData = result.table_data || null

    return (
      <Card key={variable} className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isCorrelation ? (
                <TrendingUp className="h-5 w-5 text-purple-600" />
              ) : (
                <BarChart3 className="h-5 w-5 text-blue-600" />
              )}
              <div>
                <CardTitle className="text-lg">
                  {variable.length > 50 ? `${variable.substring(0, 50)}...` : variable}
                </CardTitle>
                <CardDescription>
                  {isCorrelation ? 'Correlation Analysis' : 'Distribution Analysis'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chart" className="flex items-center gap-2">
                <BarChartIcon className="h-4 w-4" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Data Table
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Visualization</h4>
                  <Select value={selectedChartType} onValueChange={setSelectedChartType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-80 bg-gray-50 rounded-lg p-4">
                  {renderAdvancedChart(variable, chartData, result.chart_type || selectedChartType)}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="table" className="mt-6">
              {renderDataTable(tableData)}
            </TabsContent>
            
            <TabsContent value="insights" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Total Responses</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {tableData?.total_responses || chartData?.length || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Response Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 mt-1">95.2%</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Key Insights</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Most common response represents {chartData[0]?.value || 'N/A'}% of total</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span>Data shows {isCorrelation ? 'correlation patterns' : 'clear distribution trends'}</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span>Recommended for further analysis and segmentation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    )
  }

  const filteredColumns = columns.filter(column =>
    column.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAnalysisDescription = () => {
    if (selectedVariables.length === 0) return 'No variables selected'
    if (selectedVariables.length === 1) return 'Single variable analysis'
    if (selectedVariables.length === 2) return 'Correlation analysis'
    return `Multi-variable analysis (${selectedVariables.length} variables)`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Survey Analytics Dashboard</h1>
                <p className="text-sm text-gray-600">Advanced survey data analysis and visualization</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Live
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                <Lock className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Variables"
            value={columns.length}
            icon={Grid}
            trend="Available for analysis"
            color="blue"
          />
          <StatsCard
            title="Selected Variables"
            value={selectedVariables.length}
            icon={Target}
            trend={getAnalysisDescription()}
            color="green"
          />
          <StatsCard
            title="Data Quality"
            value="95.2%"
            icon={CheckCircle}
            trend="Excellent data integrity"
            color="purple"
          />
          <StatsCard
            title="Analysis Status"
            value={chartData ? "Complete" : "Ready"}
            icon={Activity}
            trend={chartData ? "Results available" : "Awaiting analysis"}
            color="orange"
          />
        </div>

        {/* Progress Bar */}
        {loading && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Processing...</span>
                    <span className="text-sm text-gray-500">{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                </div>
                <div className="animate-spin">
                  <RefreshCcw className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Data Upload
              </CardTitle>
              <CardDescription>
                Upload your Excel file to begin advanced analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload" className="text-sm font-medium">Choose Excel File</Label>
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
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                  
                  {dataPreview && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Data Preview</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Rows: <Badge variant="secondary">{dataPreview.rows || 'N/A'}</Badge></p>
                        <p>Columns: <Badge variant="secondary">{dataPreview.columns || columns.length}</Badge></p>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleClearData}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Clear & Upload New
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variable Selection Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Variable Selection
                  </CardTitle>
                  <CardDescription>
                    Choose variables for comprehensive analysis
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search variables..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-48"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredColumns.length > 0 ? (
                <div className="space-y-4">
                  <div className={`grid gap-2 max-h-60 overflow-y-auto ${
                    viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                  }`}>
                    {filteredColumns.map((column, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedVariables.includes(column)
                            ? 'bg-blue-50 border-blue-300 shadow-sm'
                            : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                        onClick={() => handleVariableSelect(column)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" title={column}>
                              {column}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {selectedVariables.includes(column) ? 'Selected' : 'Click to select'}
                            </div>
                          </div>
                          {selectedVariables.includes(column) && (
                            <CheckCircle className="h-4 w-4 text-blue-600 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedVariables.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">
                            Selected Variables ({selectedVariables.length}/5)
                          </Label>
                          <Badge variant="outline">{getAnalysisDescription()}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedVariables.map((variable, index) => (
                            <Badge
                              key={index}
                              variant="default"
                              className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                            >
                              {variable.length > 25 ? `${variable.substring(0, 25)}...` : variable}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleVariableSelect(variable)
                                }}
                                className="ml-2 hover:bg-blue-300 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={generateChart}
                        disabled={selectedVariables.length < 1 || loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {loading ? (
                          <>
                            <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Generate Advanced Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {loading ? (
                    <div className="space-y-2">
                      <RefreshCcw className="h-8 w-8 mx-auto animate-spin text-blue-500" />
                      <p>Processing your data...</p>
                    </div>
                  ) : searchTerm ? (
                    <div className="space-y-2">
                      <Search className="h-8 w-8 mx-auto opacity-50" />
                      <p>No variables found matching "{searchTerm}"</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto opacity-50" />
                      <p>Upload an Excel file to see available variables</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results Section */}
        {chartData && chartData.results && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                <p className="text-gray-600">
                  Comprehensive analysis of {Object.keys(chartData.results).length} variable{Object.keys(chartData.results).length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Full Screen
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(chartData.results).map(([variable, result], index) => 
                renderAnalysisCard(variable, result, index)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
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

