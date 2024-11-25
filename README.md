# SubjectMate - Geekathon Submission 🎓

## 📚 Overview

**SubjectMate** is an innovative educational platform created in **24 hours** during the Geekathon. It aims to empower **teachers**, **parents**, and **study helpers** to provide content that students can summarize in multiple ways and later test their skills through **AI-generated quizzes**. The platform motivates students to improve by awarding **XP points** based on their performance, making learning fun and rewarding.


https://github.com/user-attachments/assets/351156e3-7b28-4a80-89fd-4bcef91d8209

---

## 🚀 Features

### ✅ Current Capabilities

1. **Content Submission**:
   - Allows teachers, parents, or helpers to upload educational content (currently supports PDFs).
2. **AI Summarization**:
   - Summarizes content in **four distinct ways** to cater to different learning preferences.
3. **AI-Generated Tests**:
   - Automatically creates:
     - **9 Multiple-Choice Questions (MCQs)**.
     - **1 Extensive Question**.
   - Provides detailed **AI-driven feedback** to encourage and guide students.
4. **Gamification**:
   - Awards **XP points** based on test performance, incentivizing students to excel.

---

### 🔮 Future Enhancements

SubjectMate has a bold vision for the future:

1. **Teacher Feedback Loop**:
   - Students can provide feedback on content, flag outdated materials, and suggest improvements.
2. **Support for All Content Types**:
   - Expand beyond PDFs to include images, videos, text, and live interactive sessions.
4. **Leaderboards**:
   - Introduce leaderboards to foster competition among students and serve as a **talent pool** for recruiters.
5. **Test History Analytics**:
   - Allow students to track past performance and identify areas for improvement.
6. **Social Learning Network**:
   - Build a collaborative platform where students can share achievements, interact, and learn from one another.


## 🏅 Why SubjectMate?

1. **AI-Powered Personalization**:
   - Tailored feedback and summaries for individual learning needs.
2. **Engaging Gamification**:
   - XP rewards and leaderboards motivate students to improve.
3. **Real-World Impact**:
   - Bridges education and recruitment by showcasing top-performing students.
4. **Scalable Vision**:
   - Designed for continuous improvement and expansion into a global platform.

---

## 🤝 Acknowledgements

This project was ideated and developed in just **24 hours** during Geekathon. Special thanks to the **Geekathon Team**, XGeeks, AWS for creating this platform to innovate and inspire.

---

## 📬 Contact Us

Have feedback, suggestions, or collaboration ideas? We'd love to hear from you!

---

---

## 📦 How to Run the Project

### 1. **Clone the Repository**
```
git clone https://github.com/lucas-remigio/geekathon
cd geekathon
```

---

### 2. **Frontend Setup**

Navigate to the `frontend` directory and install dependencies:
```
cd frontend
npm install
```

Start the development server:
```
npm run dev
```

Frontend runs on `http://localhost:3000`.

---

### 3. **Backend Setup**

Navigate to the `backend` directory and install dependencies:
```
cd backend
composer install
```

Create the `.env` file:
```
cp .env.example .env
```

Set up the database and environment variables in `.env`:
- **Database Configurations**:
  - `DB_CONNECTION=mysql`
  - `DB_HOST=127.0.0.1`
  - `DB_PORT=3306`
  - `DB_DATABASE=geekathon`
  - `DB_USERNAME=root`
  - `DB_PASSWORD=`

Generate the application key:
```
php artisan key:generate
```

Run database migrations:
```
php artisan migrate
```

Run database seeder:
```
php artisan db:seed
```

Start the Laravel server:
```
php artisan serve
```

Backend runs on `http://127.0.0.1:8000`.


**SubjectMate** - *Transforming Education!* 🎓
