from flask import Flask, render_template,jsonify, request, redirect, url_for, session
from flask_cors import CORS
import os
# from flask_sqlalchemy import SQLAlchemy
import requests
import json
app = Flask(__name__, template_folder='static')
CORS(app)
@app.route("/")
def home():
    return jsonify(message="Hello from Flask!")
    # return render_template("index.html")
# app/app.py



app = Flask(__name__, template_folder='static')

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.root_path, 'users.db')
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db = SQLAlchemy(app)

# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     username = db.Column(db.String(100), nullable=False, unique = True)
#     password = db.Column(db.String(100), nullable=False)

#     def __init__(self, username, password):
#         self.username = username
#         self.password = password



# def makeDB():
#     with app.app_context():
#         db.create_all()  # Create tables based on the defined models

# app.secret_key = 'your-secret-key-here'  # Required for sessions

# @app.route("/")
# def home():
#     if 'user_id' in session:
#         user = User.query.get(session['user_id'])
#         return render_template("index.html")
#     return render_template("index.html")

@app.route("/Steps")
def steps():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template("./templates/Steps.html")

# @app.route("/Login", methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         username = request.form.get('username')
#         password = request.form.get('password')
        
#         user = User.query.filter_by(username=username, password=password).first()
        
#         if user:
#             session['user_id'] = user.id
#             return redirect(url_for('home'))
#         return redirect(url_for('login'))
    
#     return render_template("./templates/Login.html")

# @app.route("/Register", methods=['GET', 'POST'])
# def register():
#     if request.method == 'POST':
#         username = request.form.get('username')
#         password = request.form.get('password')
        
#         existing_user = User.query.filter_by(username=username).first()
#         if existing_user:
#             return redirect(url_for('register'))
        
#         new_user = User(username=username, password=password)
#         db.session.add(new_user)
#         db.session.commit()
        
#         return redirect(url_for('login'))
    
#     return render_template("./templates/Register.html")

@app.route("/logout")
def logout():
    session.pop('user_id', None)
    return redirect(url_for('home'))


@app.route("/testPlantAPI")
def testPlantAPI():
    # Make request to plant API and return a JSON string with correct information
    api_url = "https://my-api.plantnet.org/v2/identify/all?nb-results=1&api-key=2b10sbrhApe42g9nJ0ypm2lcO"
    image = open("../assets/dandelion.jpg", 'rb')
    file = [('images', image)]
    response = requests.post(api_url, files=file, data = {})
    result = response.json()

    # Parse JSON
    speciesName = (result['bestMatch'])
    commonName = (result['results'][0]['species']['commonNames'][0])
    return ("Species: {} <br> Common Name = {} <br> <br> <br> Results: <br> {}".format(speciesName,commonName,result))


if __name__ == "__main__":
    # makeDB()
    app.run(debug=True)