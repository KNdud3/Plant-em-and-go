let usernameBox, passwordBox,loginButton,registerButton,errorMsg;
document.addEventListener("DOMContentLoaded",()=>{
    usernameBox = document.getElementById("username")
    passwordBox = document.getElementById("password")
    loginButton = document.getElementById("login-btn")
    registerButton = document.getElementById("register-btn")
    errorMsg = document.getElementById("error-msg")

    loginButton.addEventListener("click",login)
    registerButton.addEventListener("click",register)
})

async function login(){
    try {
        // Send request to backend
        const response = await fetch(`${serverURl}/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: usernameBox.value, password:passwordBox.value}),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log("Server Response:", data);
        if(data["result"] == "login successful"){
            window.location.replace(`./templates/dummyMain.html?user=${usernameBox.value}`)
        }else{
            errorMsg.innerText = "Incorrect login details"
            usernameBox.value = ""
            passwordBox.value = ""
        }
    } catch (error) {
        console.error("Error:", error);
        alert("")
    }
}

async function register(){
    try {
        // Send request to backend
        const response = await fetch(`${serverURl}/Register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: usernameBox.value, password:passwordBox.value}),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        console.log("Server Response:", data);
        if(data["result"] == "registration successful"){
            window.location.replace(`./templates/dummyMain.html?user=${usernameBox.value}`)
            console.log("Registered")
        }else{
            errorMsg.innerText = "Incorrect login details"
            usernameBox.value = ""
            passwordBox.value = ""
        }
    } catch (error) {
        console.error("Error:", error);
        alert("")
    }
}
