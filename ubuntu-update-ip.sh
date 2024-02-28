#!/bin/bash

# Source the .env file to load the variables
if [ -f "$(dirname "$0")/.env" ]; then
    export $(cat "$(dirname "$0")/.env" | xargs)
fi

# Automatically find the first wireless network interface
WIRELESS_INTERFACE=$(ip link | awk '/wl/{print $2; exit}' | sed 's/://')
IP=$(ip addr show $WIRELESS_INTERFACE | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)
USERS=$(ls /home | paste -sd "," -) 

# Use the variables from the .env file
UNIQUE_NAME="${UNIQUE_NAME}" # Replace with your computer's unique identifier
TOKEN="${TOKEN}" # Your secret token for authentication

# Use the -H flag to add headers for Content-Type and Authorization
# Use the --data flag to send the payload as JSON
curl -X POST "https://minion-ip-update.wxunlai.workers.dev/update" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     --data "{\"uniqueName\":\"$UNIQUE_NAME\", \"username\":\"$USERS\", \"ip\":\"$IP\"}"
