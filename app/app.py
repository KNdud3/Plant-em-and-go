from flask import Flask, render_template,jsonify, request, redirect, url_for, session
from flask_cors import CORS
import os
from flask_sqlalchemy import SQLAlchemy
import requests
import datetime
import json
from io import BytesIO, BufferedReader
import base64
from helpers import score


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
    family = db.Column(db.String(50), nullable = False)
    species_name = db.Column(db.String(50), nullable = False)
    genus = db.Column(db.String(50), nullable = False)
    common_name = db.Column(db.String(50), nullable = False)
    rarity = db.Column(db.String(50), nullable = False, default = "Rare")

    def __init__(self, family_name, species_name, genus, common_name, rarity):
        self.family_name = family_name
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

#{"date" : "YYYY-MM-DD"}
@app.route('/receivedate', methods=['POST'])
def checkDate():
    data = request.get_json()
    dateInts = [int(i) for i in data.get("date").split("-")]
    currDate = datetime.date(dateInts[0], dateInts[1], dateInts[2])
    storedDate = Date.query.filter_by(id=1).first()
    print(storedDate.current_date)
    if not storedDate:
        print("No date")
        addDate = Date(currDate)
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

#{
# steps: `step num`,
# user: 'name'
#}
# change daily = (daily / mult) * new mult
@app.route('/updateScore', methods=['POST'])
def returnScore():
    # Parse JSON
    data = request.get_json()
    steps = data['steps']
    name = data['user']
    user = User.query.filter_by(username = name).first()
    multiplier = user.daily_multiplier
    new_mult = score.getMultDict(steps)
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
    return jsonify({"user_score": user.score}), 200

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


#{
# "b64image": "string",
# "user": "name"
#}
@app.route("/testPlantAPI", methods = ['POST'])
def testPlantAPI():
    # Receive base64 image
    data = request.get_json()
    b64Image = data['b64']
<<<<<<< HEAD
=======
    username = data.get("user")
    user = User.filter_by(username = username)

>>>>>>> 6c9bd785c4e732cccbda3af1d8dec857b694014a
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

    storedPlant = Plants.query.filter_by(id=1).first(species_name = species).first()
    newPlant = False
    if not storedPlant:
        newPlant = True
    else:
        user_has_plant = User_Plants.query.filter_by(user_id = user.id, plant_id = storedPlant.id)
        if not user_has_plant:
            newPlant = True
    addPlantToUser(username,family,species,genus,commonName)
    rarity = (Plants.query.filter_by(species_name = species).first()).rarity
    scoreToAdd = score.scoreAlgorithm(newPlant, rarity, user.daily_multiplier)
    if user.num_pics_today > 5:
        scoreToAdd = score.scoreAlgorithm(newPlant, rarity, user.daily_multiplier)
        user.score += scoreToAdd
        user.num_pics_today -= 1
        db.session.commit()

    return jsonify({"family": family, "species": species, "genus": genus, "common_name": commonName, "rarity": rarity})

def addPlantToUser(user_name, family, species, genus, common):
    plant = Plants.query.filter_by(species_name = species).first()
    user = User.query.filter_by(username = user_name).first()
    if not plant:
        db.session.add(Plants(family, species, genus, common, "Rare"))
        plant = Plants.query.filter_by(species_name = species).first()
    db.session.add(User_Plants(user.id, plant.id))
    db.session.commit()


#{
# "species_name": "name",
# "user": "name"
#}
@app.route("/plantinfo", methods = ['POST'])
def plantinfo():
    data = request.get_json()
    plant_name = data['species_name']
    user_name = data['user']
    plant = Plants.query.filter_by(species_name = plant_name).first()
    user = User.query.filter_by(username = user_name).first()
    user_has_plant = User_Plants.query.filter_by(user_id = user.id, plant_id = plant.id)

    has_plant = False
    if user_has_plant:
        has_plant = True

    return jsonify({"plant_family": plant.family_name, "plant_species": plant.species_name, "plant_common": plant.common_name, "user_has_plant": has_plant}), 200

if __name__ == "__main__":
    makeDB()
    # with app.app_context():
    #     new_user = User("theRat", "ratatouille25")
    #     db.session.add(new_user)
    #     new_plant = Plants("grass", "green grass", "grass blade")
    #     db.session.add(new_plant)
    #     db.session.add(User_Plants(1,1))
    #     db.session.commit()
    # check for new day so we can reset num_pics_today
    app.run(debug=True)