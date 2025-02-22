from flask import Flask, render_template
import requests
import json


app = Flask(__name__, template_folder='static')

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/Steps")
def steps():
    return render_template("Steps.html")

@app.route("/Login")
def login():
    return render_template("Login.html")

@app.route("/Register")
def register():
    return render_template("Register.html")


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
    app.run(debug=True)
