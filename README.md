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
     `cd backend`
     `uvicorn api.main:app --reload --port 8001`
  2. Second terminal
     `cd backend`
     `python manage.py runserver`
  3. Third terminal
     `cd frontend`
     <br>
     `npm install typescript@^5 --save-dev`<br>
     `npm install --legacy-peer-deps`<br>
     `npm install react-scripts --save --legacy-peer-deps`<br>
     `npm install`<br>
     `npm start` <br>
