# Dynamic IP Updater for Ubuntu and Windows Machines

This project provides scripts for automatically updating a centralized server with the current IP addresses of Ubuntu and Windows machines within a private network. The updates are sent to a Cloudflare Worker, which then stores these IP addresses for easy access and management.

### Minimal Display [Link Here](https://minion-ip-update.wxunlai.workers.dev/view)
![image](https://github.com/Chrislai502/lab-ip-management/assets/66889149/b72cb2a0-6213-4a46-a4f2-76dabb91975a)


## Setup Instructions (Ubuntu and Windows)

### Prerequisites:

- A Cloudflare account with Workers enabled.
- A Cloudflare Worker deployed to accept and store IP address updates.
- The Worker's endpoint URL.
- A secret token for authentication with the Worker.

## Ubuntu Machine Setup

1. **Local Environment Details**: Rename `sample.env` into `.env`, and then name your device (Computer). The secret token will be given at the end of these instructions.:

2. **Make Executable**: Grant execution permissions to the script:

    ```bash
    chmod +x ubuntu-update-ip.sh
    ```

4. **Cron Job Setup**: To automatically run the script at regular intervals, add a cron job:

    ```bash
    crontab -e
    ```

    Add the following line to run the script every 20 minutes:

    ```cron
    */20 * * * * /path/to/ubuntu-update-ip.sh
    ```
5. **Add secret token:** Good, if you have read all the above, the TOKEN is `roarmeow`. Add it to the `.env` file.

## Windows Machine Setup

1. **Create the Script File**: Create a new file named `update-ip.ps1` on your Windows machine.

2. **Script Content**: Copy the following PowerShell script into `update-ip.ps1`, replacing placeholders with actual values:

    ```powershell
    $ip = Test-Connection -ComputerName (hostname) -Count 1 | Select -ExpandProperty IPV4Address
    $username = [Environment]::UserName
    $uniqueName = "unique-computer-identifier" # Replace with your computer's unique identifier
    $token = "your_secret_token" # Your secret token for authentication

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $body = @{
        uniqueName = $uniqueName
        username = $username
        ip = $ip
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "https://your-worker-endpoint/update" -Method Post -Headers $headers -Body $body
    ```

3. **Scheduled Task for Automation**: Use Windows Task Scheduler to run `update-ip.ps1` at your preferred intervals.

    - Open Task Scheduler and create a new task.
    - Set the trigger to your preferred schedule.
    - For the action, choose "Start a Program" with `powershell.exe` as the program and `-ExecutionPolicy Bypass -File "path\to\update-ip.ps1"` as the arguments.


## Security Note

Ensure the secret token used for authentication with the Cloudflare Worker is kept secure and not exposed in publicly accessible locations.

## Conclusion

This setup allows for dynamic IP address management across Ubuntu and Windows machines, simplifying network administration and access within a private network.
