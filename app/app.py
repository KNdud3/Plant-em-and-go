from flask import Flask, render_template,jsonify, request, redirect, url_for, session
from flask_cors import CORS
import os
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, desc, over
import requests
import datetime
import json
from io import BytesIO, BufferedReader
import base64
from helpers import score

# Basic python files
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
    daily_steps = db.Column(db.Integer, nullable = False, default = 0)
    num_pics_today = db.Column(db.Integer, nullable = False, default = 0)

    def __init__(self, username, password):
        self.username = username
        self.password = password

class Plants(db.Model):
    __tablename__ = "Plants"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    family = db.Column(db.String(50), nullable = False)
    species_name = db.Column(db.String(50), nullable = False)
    genus = db.Column(db.String(50), nullable = False)
    common_name = db.Column(db.String(50), nullable = False)
    rarity = db.Column(db.String(50), nullable = False, default = "Rare")

    def __init__(self, family, species_name, genus, common_name, rarity):
        self.family = family
        self.species_name = species_name
        self.genus = genus
        self.common_name = common_name
        self.rarity = rarity

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

#For pokedex
@app.route("/getallplants")
def getallplants():
    print("here")
    plants = Plants.query.all()
    data=[{
        'species_name': plant.species_name,
        "common_name":plant.common_name,
        'family': plant.family,
        'genus': plant.genus,
        'rarity': plant.rarity
           
        } 
       
       for plant in plants]
    return jsonify({"data":data})



#{"date" : "YYYY-MM-DD"}
@app.route('/receivedate', methods=['POST'])
def checkDate():
    data = request.get_json()
    dateInts = [int(i) for i in data.get("date").split("-")] # Split date string into list of ints
    currDate = datetime.date(dateInts[0], dateInts[1], dateInts[2])
    storedDate = Date.query.filter_by(id=1).first()
    if not storedDate:
        print("No date")
        addDate = Date()
        db.session.add(addDate)
        db.session.commit()
        return jsonify({"status": "new_day"}), 200
    elif storedDate.current_date != currDate:
        # Bulk update: Set daily_score to 0, num_pics_today to 0 and daily_multiplier to 1 for all users
        db.session.query(User).update({
            User.daily_score: 0,
            User.daily_steps: 0,
            User.daily_multiplier: 1,
            User.num_pics_today: 0
        })
        storedDate.current_date = currDate
        db.session.commit()
        return jsonify({"status": "new_day"}), 200
    return jsonify({"status": "same_day"}), 200  # No change in date

#{
# user: 'name'
#}
# change daily = (daily / mult) * new mult
@app.route('/updateScore', methods=['POST'])
def returnScore():
    # Parse JSON
    
    data = request.get_json()
    name = data['user']
    user = User.query.filter_by(username = name).first()
    multiplier = user.daily_multiplier
    new_mult = score.getMultDict(user.daily_steps)
    if  new_mult != multiplier: # new_mult should always be >= multiplier
        # Retrieve relevant fields
        daily_score = user.daily_score
        total_score = user.score

        # Update score
        total_score -= daily_score
        daily_score = (daily_score / multiplier) * new_mult
        total_score += daily_score

        # Update database fields
        user.total_score = total_score
        user.daily_score = daily_score
        user.multiplier = new_mult

        db.session.commit()
    return jsonify({"user_score": user.score, "steps":user.daily_steps}), 200

# {"steps": step number (integer)
#  "user": 'name'}
@app.route('/updateSteps', methods=['POST'])
def incrementSteps():
    data = request.get_json()
    name = data['user']
    user = User.query.filter_by(username = name).first()
    user.daily_steps += data['steps']
    db.session.commit()
    return ""

# Base web page for testing
@app.route("/")
def home():
    return jsonify(message="Hello from Flask!")
    # return render_template("index.html")

@app.route('/upload-photo', methods=['POST'])
def upload_photo():
    try:
        # Get the base64 image data
        image_data = request.form['image']
        
        # Convert base64 to image and save
        image_path = "static/img/photo.jpg"
        os.makedirs(os.path.dirname(image_path), exist_ok=True)
        
        with open(image_path, "wb") as fh:
            fh.write(base64.b64decode(image_data))
        
        return jsonify({'success': True, 'path': image_path})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


# Tenplate used for front end testing
@app.route("/Steps")
def steps():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return render_template("./templates/Steps.html")

# Basic login system
@app.route("/Login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        user = User.query.filter_by(username=username, password=password).first()
        
        if user:
            session['user_id'] = user.id
            return jsonify({"result":"login successful"})
        return jsonify({"result":"login not successful"})
    
    return render_template("./templates/Login.html")

# Basic registration method
@app.route("/Register", methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({"result":"username taken"})

        new_user = User(username=username, password=password)
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"result":"registration successful"})
    
    return render_template("./templates/Register.html")


@app.route("/logout")
def logout():
    session.pop('user_id', None)
    return redirect(url_for('home'))


#{
# "b64image": "string",
# "user": "name"
#}
@app.route("/testPlantAPI", methods = ['POST'])
def testPlantAPI():
    # Receive base64 image
    data = request.get_json()
    b64Image = data['b64']
    username = data.get("user")
    user = User.query.filter_by(username = username).first()

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
    species = (result['results'][0]['species']['scientificNameWithoutAuthor'])
    commonName = (result['results'][0]['species']['commonNames'][0])
    family = (result['results'][0]['species']['family']['scientificNameWithoutAuthor'])
    genus = (result['results'][0]['species']['genus']['scientificNameWithoutAuthor'])

    storedPlant = Plants.query.filter_by(species_name = species).first()
    newPlant = False # Needed to check for new plant bonus
    if not storedPlant:
        newPlant = True
    else:
        user_has_plant = User_Plants.query.filter_by(user_id = user.id, plant_id = storedPlant.id).first()
        if not user_has_plant:
            db.session.add(User_Plants(user.id,storedPlant.id))
            db.session.commit()
            newPlant = True
    addPlantToUser(username,family,species,genus,commonName, decoded)
    rarity = (Plants.query.filter_by(species_name = species).first()).rarity
    if user.num_pics_today < 5:
        scoreToAdd = score.scoreAlgorithm(newPlant, rarity, user.daily_multiplier)
        user.score += scoreToAdd
        user.num_pics_today += 1
        db.session.commit()

    return jsonify({"family": family, "species": species, "genus": genus, "common_name": commonName, "rarity": rarity})

# Helper function to add plant to a user and save it to directory to be put in compendium
def addPlantToUser(user_name, family, species, genus, common, img):
    plant = Plants.query.filter_by(species_name = species).first() 
    user = User.query.filter_by(username = user_name).first()
    if not plant:
        db.session.add(Plants(family, species, genus, common, score.getRandomRarity())) # Add plant to DB if not already present
        with open("static/plantImages/" + species + ".jpg", "wb") as f: # Get file directory to save to
            f.write(img)
            os.sync(f)
        plant = Plants.query.filter_by(species_name = species).first()
    user_has_plant = User_Plants.query.filter_by(user_id = user.id, plant_id = plant.id).first()
    if not user_has_plant:
        db.session.add(User_Plants(user.id,plant.id)) # Add user plant if needed
    db.session.commit()


#{
# "species_name": "name",
# "user": "name"
#}
# Post request used for testing plants
@app.route("/plantinfo", methods = ['POST'])
def plantinfo():
    data = request.get_json()
    plant_name = data['species_name']
    user_name = data['user']
    plant = Plants.query.filter_by(species_name = plant_name).first()
    user = User.query.filter_by(username = user_name).first()
    user_has_plant = User_Plants.query.filter_by(user.id,plant.id) 

    has_plant = False # Needed for front end to grey our un-used parts
    if user_has_plant:
        has_plant = True

    return jsonify({"plant_family": plant.family, "plant_species": plant.species_name, "plant_common": plant.common_name, "user_has_plant": has_plant}), 200

# GET reques for the user data needed for the leaderboard
@app.route("/leaderboard")
def leaderboard():
    users = User.query.order_by(desc(User.score)).all()
    query = db.session.query(
        func.row_number().over(order_by=desc(User.score)).label('row_number'), # Score is descending
        User.id,
        User.username,
        User.score,
    ).all()
    # Process the results
    results = [{"rank": user.row_number, "name": user.username, "score": user.score, "plants-identified": (User_Plants.query.filter_by(user_id = user.id).count())} for user in query]
    return jsonify({"users": results})

if __name__ == "__main__":
    makeDB()
    app.run(debug=True)