# 0040-LaunchAssetBundle — Primary terminal demo (20–35s)
# Story: change → commit → signed receipt → verify → VALID
# Uses ledgerful demo (0039) to create a synthetic repo and run the real hook flow.

Output "C:\dev\ledgerful-web\public\demo\demo-core-loop.gif"

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
Type "Remove-Item -Recurse -Force -ErrorAction SilentlyContinue C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-core-loop"
Enter
Sleep 500ms
Show

Type "ledgerful demo --output C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-core-loop --keep --force"
Enter

# ledgerful demo target runtime: 15–30s warm; wait generously for cold capture
Sleep 35s

# Hold the final SUCCESS + verifier instruction on screen briefly
Sleep 3s

# Run the verifier — this is the final VALID beat
Type "cd C:\Users\RyanB\AppData\Local\Temp\opencode\vhs-core-loop && ledgerful verify --signatures"
Enter

# wait for verify to finish
Sleep 8s

# Final frame lingers on VALID
Sleep 5s
