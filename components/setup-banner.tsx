"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, X } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase"

export function SetupBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (isSupabaseConfigured() || dismissed) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50 mb-4">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <div>
            <p className="text-sm font-medium text-orange-800">Demo Mode Active</p>
            <p className="text-xs text-orange-700">
              Configure Supabase environment variables to enable full functionality
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="text-orange-600 hover:text-orange-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
