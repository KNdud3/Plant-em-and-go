from flask import Flask, render_template,jsonify, request, redirect, url_for, session
from flask_cors import CORS
import os
from flask_sqlalchemy import SQLAlchemy
import requests
import datetime
import json
from io import BytesIO, BufferedReader
import base64

app = Flask(__name__, template_folder='static')
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.root_path, 'users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = "Users"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), nullable=False, unique = True)
    password = db.Column(db.String(100), nullable=False)
    score = db.Column(db.Integer, nullable=False, default = 0)
    daily_multiplier = db.Column(db.Float, nullable = False, default = 1)
    daily_score = db.Column(db.Integer, nullable = False, default = 0)
    num_pics_today = db.Column(db.Integer, nullable = False, default = 0)

    def __init__(self, username, password):
        self.username = username
        self.password = password

class Plants(db.Model):
    __tablename__ = "Plants"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    family_name = db.Column(db.String(50), nullable = False)
    species_name = db.Column(db.String(50), nullable = False)
    common_name = db.Column(db.String(50), nullable = False)

    def __init__(self, family_name, species_name, common_name):
        self.family_name = family_name
        self.species_name = species_name
        self.common_name = common_name

class User_Plants(db.Model):
    __tablename__ = "User_Plants"

    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), primary_key=True)
    plant_id = db.Column(db.Integer, db.ForeignKey('Plants.id'), primary_key=True)
    
    __table_args__ = (db.PrimaryKeyConstraint('user_id', 'plant_id'),)

    def __init__(self, user, plant):
        self.user_id = user
        self.plant_id = plant

# Stores the date so we can know when the user has entered a new day
class Date(db.Model):
    __tablename__ = "Date"
    current_date = db.Column(db.Date, nullable = False, primary_key = True, default = datetime.date.today)



def makeDB():
    with app.app_context():
        db.create_all()  # Create tables based on the defined models

app.secret_key = 'your-secret-key-here'  # Required for sessions



@app.route("/")
def home():
    return jsonify(message="Hello from Flask!")


@app.route("/Steps")
def steps():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template("./templates/Steps.html")


@app.route("/logout")
def logout():
    session.pop('user_id', None)
    return redirect(url_for('home'))


@app.route("/testPlantAPI", methods = ['POST'])
def testPlantAPI():
    # Receive base64 image
    info = request.get_json()
    b64Image = request['b64image']
    decoded = base64.b64decode(b64Image)
    file_like = BytesIO(decoded)

    # Make request to plant API and return a JSON string with correct information
    api_url = "https://my-api.plantnet.org/v2/identify/all?nb-results=1&api-key=2b10sbrhApe42g9nJ0ypm2lcO"
    # image = open("../assets/dandelion.jpg", 'rb')
    image = BufferedReader(file_like)
    file = [('images', image)]
    response = requests.post(api_url, files=file, data = {})
    result = response.json()

    # Parse JSON
    speciesName = (result['bestMatch'])
    commonName = (result['results'][0]['species']['commonNames'][0])
    return ("Species: {} <br> Common Name = {} <br> <br> <br> Results: <br> {}".format(speciesName,commonName,result))


@app.route("/plantinfo", methods = ['GET'])
def plantinfo():
    data = request.get_json()
    name = data['species_name']
    plant = Plants.query.filter_by(species_name = name).first()
    return f"This plant comes from the {plant.family_name} family!\nIt's scientific name is {plant.species_name}, but it is commonly referred to as {plant.common_name}"


if __name__ == "__main__":
    # with app.app_context():
    #     makeDB()
    #     new_user = User("theRat", "ratatouille25")
    #     db.session.add(new_user)
    #     new_plant = Plants("grass", "green grass", "grass blade")
    #     db.session.add(new_plant)
    #     db.session.add(User_Plants(1,1))
    #     db.session.commit()
    makeDB()
    # check for new day so we can reset num_pics_today
    app.run(debug=True)