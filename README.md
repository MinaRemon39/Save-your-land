# Save-your-land

# Instructions 
- git clone repo
- open folder of repo and create virtual environment with pythonV10 (ensure you install pythonV10)
  - `py -3.10 -m venv env` -> in terminal open within folder of repo
- Activate the virtual environment
  - `env\Scripts\activate.bat` -> in terminal open within folder of repo
- Install requirements of python
  - `pip install -r requirements.txt`
- Donwload node js from official website
- open 3 terminals within folder of repo
  1. First terminal
     - `env\Scripts\activate.bat`
     - `cd backend`
     - `uvicorn api.main:app --reload --port 8001`
  3. Second terminal
     - `env\Scripts\activate.bat`
     - `cd backend`
     - `python manage.py runserver`
  5. Third terminal
     - `env\Scripts\activate.bat`
     - `cd frontend`
     - `rm -rf node_modules package-lock.json`
     - `npm install --legacy-peer-deps`
     - `npm install i18next react-i18next --legacy-peer-deps`
     - `npm install ajv@6 ajv-keywords@3 --save --legacy-peer-deps`
     - `npm start` 
