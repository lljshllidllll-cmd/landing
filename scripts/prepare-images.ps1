$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sourceDir = 'C:\Users\82106\Desktop\1986\기타\사진\센터사진\중산\1986피트니스준공사진 (2)\고해상'
$outputDir = Join-Path $PSScriptRoot '..\public\images\jungsan'
$names = @(
  'CMJ_0076.jpg','CMJ_0091.jpg','CMJ_0040.jpg','CMJ_0067.jpg','CMJ_0085.jpg',
  'CMJ_0112.jpg','CMJ_0034.jpg','CMJ_0055.jpg','CMJ_0049.jpg','CMJ_0094.jpg',
  'CMJ_0007.jpg','CMJ_0004.jpg','CMJ_0028.jpg','CMJ_0025.jpg','CMJ_0019.jpg',
  'CMJ_0046.jpg','CMJ_0106.jpg','CMJ_0013.jpg','CMJ_0061.jpg','CMJ_0100.jpg'
)

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$quality = [System.Drawing.Imaging.EncoderParameters]::new(1)
$quality.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, 84L)

foreach ($name in $names) {
  $sourcePath = Join-Path $sourceDir $name
  if (-not (Test-Path -LiteralPath $sourcePath)) { throw "Missing source: $sourcePath" }
  $source = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    $scale = [Math]::Min(1.0, 1920.0 / [Math]::Max($source.Width, $source.Height))
    $width = [int][Math]::Round($source.Width * $scale)
    $height = [int][Math]::Round($source.Height * $scale)
    $bitmap = [System.Drawing.Bitmap]::new($width, $height)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $width, $height)
      } finally { $graphics.Dispose() }
      $targetPath = Join-Path $outputDir $name.ToLowerInvariant()
      $bitmap.Save($targetPath, $jpegCodec, $quality)
      Write-Output "$name -> $width x $height"
    } finally { $bitmap.Dispose() }
  } finally { $source.Dispose() }
}
