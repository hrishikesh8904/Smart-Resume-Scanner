import { useEffect, useState } from 'react'
import axios from 'axios'

function UploadForm({ onUploaded }) {
  const [files, setFiles] = useState([])
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!files.length || !jobDescription.trim()) return
    const form = new FormData()
    for (const f of files) form.append('resumes', f)
    form.append('jobDescription', jobDescription)
    setLoading(true)
    try {
      await axios.post('/api/resumes/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setFiles([])
      setJobDescription('')
      onUploaded?.()
    } catch (err) {
      alert(err?.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
      <div>
        <label className="block font-medium mb-1">Upload Resumes (PDF or TXT)</label>
        <input
          type="file"
          accept="application/pdf,text/plain"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block w-full"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Job Description</label>
        <textarea
          className="w-full border rounded p-2 min-h-[120px]"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Process Resumes'}
      </button>
    </form>
  )
}

function CandidatesList({ refreshSignal }) {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)

  async function fetchCandidates() {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/resumes/candidates')
      setCandidates(data.candidates || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCandidates() }, [refreshSignal])

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ranked Candidates</h2>
        <button className="text-sm text-blue-600" onClick={fetchCandidates}>Refresh</button>
      </div>
      {loading && <p className="text-sm text-gray-500 mt-2">Loading...</p>}
      <ul className="divide-y mt-2">
        {candidates.map((c) => (
          <li key={c.id} className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-600">{c.justification}</p>
              </div>
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-700 font-bold">
                {c.score}
              </span>
            </div>
          </li>
        ))}
        {!candidates.length && !loading && (
          <li className="py-3 text-gray-500">No candidates yet. Upload resumes to get started.</li>
        )}
      </ul>
    </div>
  )
}

export default function App() {
  const [refresh, setRefresh] = useState(0)
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Smart Resume Screener</h1>
        <p className="text-gray-600">Upload resumes, compare to a job description, and view ranked candidates.</p>
      </header>
      <UploadForm onUploaded={() => setRefresh((r) => r + 1)} />
      <CandidatesList refreshSignal={refresh} />
    </div>
  )
}


