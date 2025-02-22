from flask import Flask, render_template,jsonify, request, redirect, url_for, session
from flask_cors import CORS
import os
from flask_sqlalchemy import SQLAlchemy
import requests
import datetime
import json
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
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    current_date = db.Column(db.Date, nullable = False, default = datetime.date.today)



def makeDB():
    with app.app_context():
        db.create_all()  # Create tables based on the defined models

app.secret_key = 'your-secret-key-here'  # Required for sessions

#{"date" : "YYYY-MM-DD"}
@app.route('/receivedate', methods=['POST'])
def checkDate():
    data = request.get_json()
    dateInts = [int(i) for i in data.get("date").split("-")]
    currDate = datetime.date(dateInts[0], dateInts[1], dateInts[2])
    storedDate = Date.query.filter_by(id=1).first()
    if not storedDate:
        addDate = Date()
        db.session.add(addDate)
        db.session.commit()
        return jsonify({"status": "new_day"}), 200
    elif storedDate.current_date != currDate:
        # Bulk update: Set daily_score to 0, num_pics_today to 0 and daily_multiplier to 1 for all users
        db.session.query(User).update({
            User.daily_score: 0,
            User.daily_multiplier: 1,
            User.num_pics_today: 0
        })
        storedDate.current_date = currDate
        db.session.commit()
        return jsonify({"status": "new_day"}), 200
    return jsonify({"status": "same_day"}), 200  # No change in date

#{steps: `step num`}
@app.route('/updateScore', methods=['POST'])
def returnScore():
    data = request.get_json()

    
        
    


@app.route("/")
def home():
    return jsonify(message="Hello from Flask!")


@app.route("/Steps")
def steps():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template("./templates/Steps.html")

@app.route("/Login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username, password=password).first()
        
        if user:
            session['user_id'] = user.id
            return redirect(url_for('home'))
        return redirect(url_for('login'))
    
    return render_template("./templates/Login.html")

@app.route("/Register", methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return redirect(url_for('register'))
        
        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        
        return redirect(url_for('login'))
    
    return render_template("./templates/Register.html")


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
    makeDB()
    # check for new day so we can reset num_pics_today
    app.run(debug=True)