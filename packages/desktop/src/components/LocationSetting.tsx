import { useEffect, useState } from 'react'
import { downloadDir } from '@tauri-apps/api/path'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LocationSetting() {
  const [path, setPath] = useState('')
  useEffect(() => {
    downloadDir()
      .then(setPath)
      .catch(() => {})
  }, [])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between py-3">
          <div className="">
            <small className="text-sm font-medium leading-none">Path</small>
            <p className="text-sm text-muted-foreground">{path}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LocationSetting
