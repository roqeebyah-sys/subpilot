'use client'

import { useState } from 'react'

export default function CSVUploadButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/csv/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 mb-6">
      <h2 className="text-sm font-semibold mb-1">Import customers</h2>
      <p className="text-xs text-white/40 mb-4">
        Upload a CSV from PayPal, Gumroad, Teachable, or any spreadsheet.
        SubPilot auto-detects the columns.
      </p>

      <label className="cursor-pointer">
        <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
          {loading ? (
            <>
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </>
          ) : '📂 Upload CSV file'}
        </div>
        <input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      {result && (
        <div className="mt-4">
          {result.imported !== undefined ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="text-sm font-medium text-emerald-400 mb-1">
                ✓ Import complete
              </div>
              <div className="text-xs text-white/50 space-y-1">
                <div>{result.imported} customers imported</div>
                {result.skipped > 0 && <div>{result.skipped} rows skipped (no email)</div>}
                <div className="text-white/30 mt-2">
                  Detected columns: {JSON.stringify(result.mapping)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
              ⚠ {result.error || 'Upload failed'}
              {result.needsMapping && (
                <div className="text-xs text-white/40 mt-2">
                  Could not auto-detect columns. Headers found: {result.headers?.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}