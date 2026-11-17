# WeConnectU — How to run

## Requirements : Docker / PodMan

## 1. Start the stack

Hopefully you managed to extract the contents of the compose.zip and cd into the directory :) 

From this folder:

```bash
docker compose up 
```

MySql will about 20 seconds to get started then simply use one of the links below to test.

- Frontend: http://localhost:3000
- Backend for Postman : http://localhost:8080


## 2. Windows only — fix line endings first

If you're on Windows, `DBschema.sql` may have CRLF line endings, which breaks the MySQL init. 
Please Run the powershell commmand below before attempting to compose.
PS: You need run this from the folder which houses the extracted files.


```powershell
(Get-Content .\DBschema.sql -Raw) -replace "`r`n", "`n" | Set-Content .\DBschema.sql -NoNewline
```


```powershell
docker compose up
```
Give it a few seconds to warm up and Bob's your uncle.

## Stop

This command will stop the orchestration whilst retaining the data.
```bash
docker compose down 
```

To get rid of the volumes and networks created by the compose simply use

```bash
docker compose down -v
```