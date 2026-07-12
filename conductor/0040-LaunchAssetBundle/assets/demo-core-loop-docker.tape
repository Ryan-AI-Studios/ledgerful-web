Output "/output/demo-core-loop.gif"

Set Shell "bash"
Set Theme "DoomOne"
Set FontFamily "JetBrains Mono"
Set FontSize 14
Set Width 1200
Set Height 600
Set Padding 20
Set TypingSpeed 50ms

# Clean start
Hide
Type "rm -rf /tmp/vhs-core-loop"
Enter
Sleep 500ms
Show

Type "ledgerful demo --output /tmp/vhs-core-loop --keep --force"
Enter

# ledgerful demo target runtime: 15-30s warm; wait generously for cold capture
Sleep 40s

# Hold the final SUCCESS + verifier instruction on screen briefly
Sleep 3s

# Run the verifier — this is the final VALID beat
Type "cd /tmp/vhs-core-loop && ledgerful verify --signatures"
Enter

# wait for verify to finish
Sleep 8s

# Final frame lingers on VALID
Sleep 5s