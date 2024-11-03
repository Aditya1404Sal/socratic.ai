from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "Hello, World!"

@app.route('/prompt-v1')
def prompt_v1():
    return "This is the prompt v1"

@app.route('/prompt-v2')
def prompt_v2():
    return "This is the prompt v2"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)