let usernameBox, passwordBox,loginButton,registerButton;
document.addEventListener("DOMContentLoaded",()=>{
    usernameBox = document.getElementById("username")
    passwordBox = document.getElementById("password")
    loginButton = document.getElementById("login-btn")
    registerButton = document.getElementById("register-btn")

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
            body: JSON.stringify({ username: usernameBox.data, password:passwordBox.data}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Server Response:", data);
        
    } catch (error) {
        console.error("Error:", error);
    }
}

function register(){

}
