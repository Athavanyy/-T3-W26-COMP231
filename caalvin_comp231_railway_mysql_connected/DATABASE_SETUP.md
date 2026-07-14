# Railway MySQL connection

## Run the full project

1. Open this folder in VS Code.
2. Open a terminal in the folder containing `package.json`.
3. Run:

```bash
npm install
npm run dev
```

The React site runs at `http://localhost:5173` and the API at `http://localhost:3000`.

## Test the database

Open `http://localhost:3000/api/health` in a browser. A successful response contains `"status":"ok"`.

Other useful endpoints:

- `GET http://localhost:3000/api/clubs`
- `GET http://localhost:3000/api/events`
- `GET http://localhost:3000/api/executive/dashboard`

## Security

The `.env` file is ignored by Git. Do not upload it to GitHub. Regenerate the Railway password because it was shared in chat, then replace `DB_PASSWORD` in `.env`.
