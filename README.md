# 🚀 QuickServe

QuickServe is a full-stack service booking platform (similar to Uber for home services) that connects **customers** with **verified nearby providers** such as Plumbers, AC Repair technicians, and more.

---

## 🌐 Live URLs

### Frontend (Vercel)
https://quickserve-nu.vercel.app

### Backend (Render)
https://quickserve-mdn2.onrender.com

### API Documentation
https://quickserve-mdn2.onrender.com/docs

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- Axios
- Tailwind CSS
- Vercel Hosting

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL (Render)
- Supabase (Storage)
- Cloudinary (Images)
- JWT Authentication

---

## 📁 Project Structure

QuickServe/
│
├── backend/
│ ├── main.py
│ ├── database.py
│ ├── models.py
│ ├── routers/
│ └── utils/
│
├── frontend/
│ ├── src/
│ ├── public/
│ └── vite.config.js
│
├── requirements.txt
├── setup.sh
├── README.md
└── .env.example



---

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST:PORT/DBNAME

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=sb_secret_xxxxxxxxxxxxx

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

JWT_SECRET=supersecretkey
```
##🏃 Run Locally

Backend

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload


Frontend

cd frontend
npm install
npm run dev


🚀 Deployment
Backend (Render)

Build command:
pip install -r requirements.txt

Start command:
uvicorn main:app --host 0.0.0.0 --port 10000

Frontend (Vercel)
npm run build


👨‍💻 Author

Omkar Solanke
GitHub: https://github.com/omkarsolanke

📄 License

MIT License
EOF
