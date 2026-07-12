# 0040-LaunchAssetBundle — Full walkthrough demo (60–90s)
# Story: core loop + evidence export + trust-boundary framing
# Same ledgerful demo start as the primary capture; adds CLI SOC2 evidence export.

Output "C:\dev\ledgerful-web\public\demo\demo-full-walkthrough.gif"

Set Shell "powershell"
Set Theme "DoomOne"
Set FontFamily "JetBrains Mono"
Set FontSize 14
Set Width 1200
Set Height 600
Set Padding 20
Set TypingSpeed 50ms

# Clean start
Hide
Type "Remove-Item -Recurse -Force -ErrorAction SilentlyContinue C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-full"
Enter
Sleep 500ms
Show

Type "ledgerful demo --output C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-full --keep --force"
Enter

# wait for the synthetic repo + commits + verify + export
Sleep 35s

# Pause on the demo SUCCESS / export path
Sleep 3s

# Show the produced export path explicitly
Type "Get-ChildItem C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-full\ledgerful-DEMO-evidence.zip | Select-Object Name, Length"
Enter
Sleep 2s

# Show trust-boundary framing: the export filename is DEMO-marked and self-identifies
Type "unzip -l C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-full\ledgerful-DEMO-evidence.zip 2>$null || Expand-Archive -Path C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-full\ledgerful-DEMO-evidence.zip -DestinationPath C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-full\unzipped -Force; Get-ChildItem C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-full\unzipped -Recurse | Select-Object FullName, Length"
Enter
Sleep 3s

# The CLI evidence export command itself (0039 deliverable)
Type "ledgerful export evidence --profile soc2 --out C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-full\ledgerful-soc2-evidence.zip --force"
Enter
Sleep 8s

# Verify both the demo export and the fresh CLI export
Type "ledgerful verify --signatures --against-export C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-full\ledgerful-DEMO-evidence.zip"
Enter
Sleep 8s

# Final VALID frame
Type "ledgerful verify --signatures"
Enter
Sleep 8s

# Hold on VALID
Sleep 5s
