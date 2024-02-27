#!/bin/bash
IP=$(hostname -I | cut -d' ' -f1)
USERNAME=$(whoami)
UNIQUE_NAME="paws" # Replace with your computer's unique identifier
TOKEN="roarmeow" # Your secret token for authentication

# Use the -H flag to add headers for Content-Type and Authorization
# Use the --data flag to send the payload as JSON
curl -X POST "https://minion-ip-update.wxunlai.workers.dev/update" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     --data "{\"uniqueName\":\"$UNIQUE_NAME\", \"username\":\"$USERNAME\", \"ip\":\"$IP\"}"
