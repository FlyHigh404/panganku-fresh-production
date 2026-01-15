"use client"

import type React from "react"
import { useRef, useState } from "react"

interface FileDropzoneProps {
  onFilesDrop: (files: FileList) => void
  accept?: string
  multiple?: boolean
  label: string
  id: string
}

export default function FileDropzone({ onFilesDrop, accept = "*", multiple = false, label, id }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFilesDrop(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesDrop(files)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`absolute inset-0 rounded-lg cursor-pointer transition-all duration-200
        ${isDragOver ? "bg-green-50 border-green-400 border-2 border-dashed" : ""}
      `}
    >
      {/* input file transparan menutupi seluruh area */}
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  )
}
