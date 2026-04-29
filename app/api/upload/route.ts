import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
      { status: 400 }
    )
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 5MB' },
      { status: 400 }
    )
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN.' },
      { status: 500 }
    )
  }

  try {
    // Sanitize filename: remove special chars, keep extension
    const safeName = file.name.replaceAll(/[^a-zA-Z0-9._-]/g, '_')
    const pathname = `menu-images/${Date.now()}-${safeName}`

    const blob = await put(pathname, file, {
      access: 'public',
      token,
      addRandomSuffix: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image. Check your Blob storage configuration.' },
      { status: 500 }
    )
  }
}
