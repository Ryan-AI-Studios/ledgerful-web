Output "/output/demo-full-walkthrough.gif"

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
Type "rm -rf /tmp/vhs-full"
Enter
Sleep 500ms
Show

Type "ledgerful demo --output /tmp/vhs-full --keep --force"
Enter

# wait for the synthetic repo + commits + verify + export
Sleep 40s

# Pause on the demo SUCCESS / export path
Sleep 3s

# Show the produced export path explicitly
Type "ls -la /tmp/vhs-full/ledgerful-DEMO-evidence.zip"
Enter
Sleep 2s

# Show trust-boundary framing: the export filename is DEMO-marked and self-identifies
Type "unzip -l /tmp/vhs-full/ledgerful-DEMO-evidence.zip"
Enter
Sleep 3s

# The CLI evidence export command itself (0039 deliverable)
Type "ledgerful export evidence --profile soc2 --out /tmp/vhs-full/ledgerful-soc2-evidence.zip --force"
Enter
Sleep 8s

# Verify both the demo export and the fresh CLI export
Type "ledgerful verify --signatures --against-export /tmp/vhs-full/ledgerful-DEMO-evidence.zip"
Enter
Sleep 8s

# Final VALID frame
Type "cd /tmp/vhs-full && ledgerful verify --signatures"
Enter
Sleep 8s

# Hold on VALID
Sleep 5s