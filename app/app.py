from flask import Flask, render_template

app = Flask(__name__, template_folder="static/templates")  # Custom template folder
app = Flask(__name__, template_folder='static/templates')

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

if __name__ == "__main__":
    app.run(debug=True)
