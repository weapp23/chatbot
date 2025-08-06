const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");

// API setup
const API_KEY = "AIzaSyColD8fBls02XXF8Jl1P9k6lA65dpnTbt8";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}

// create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}
// generate bot response using API
const generateBotResponse = async (incomingMessageDiv) => {

    const messageElement = incomingMessageDiv.querySelector(".message-text");

    // API request options

      const parts = [{ text: userData.message }];
         if (userData.file.data) {
              parts.push({
                inline_data: {
                    mime_type: userData.file.mime_type,
                    data: userData.file.data
                }
            });
        }

        const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [
                {
                    role: "user",
                    parts: parts
                }
            ]
        })
    };

        try{
            // fetch bot response from API
            const response = await fetch(API_URL, requestOptions);
            const data = await response.json();
            if(!response.ok) throw new Error(data.error.message);

            // extract and display bot's response text
             const apiResponseText = data.candidates[0].content.parts[0].text.replace(/^\*+|\*+$/g, '').trim();
            // const apiResponseText = data.choices[0].message.content.replace(/^\d+$/, "*").trim();
            messageElement.innerText = apiResponseText;
        }catch (error) {
            // handle error in API response
            console.log(error);
            messageElement.innerText = error.message;
            messageElement.style.color= "#ff0000";
        }finally{
            // reset user's file data, removing thinking indicator and scroll chat to bottom
            userData.file = {};
            incomingMessageDiv.classList.remove("thinking"); 
            chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});
        }
    }

// handle out going user message
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";

    // create and display user message
    const messageContent = `<div class="message-text"></div>
                            ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}"class="attachment"/>` : ""}`; 

    const outgogingMessageDiv = createMessageElement(messageContent,"user-message");   
    outgogingMessageDiv.querySelector(".message-text").textContent = userData.message; 
    chatBody.appendChild(outgogingMessageDiv);
    chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});

    // simulate bot reponse with thinking after a delay
    setTimeout(() => {
       
        const messageContent = ` <svg class="bot-avatar" width="144px" height="144px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path fill-rule="nonzero" d="M13 4.055c4.5.497 8 4.312 8 8.945v9H3v-9c0-4.633 3.5-8.448 8-8.945V1h2v3.055zM19 20v-7a7 7 0 0 0-14 0v7h14zm-7-2a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path> </g> </g></svg>
                <div class="message-text">
                   <div class="thiking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                   </div>  
                </div>`; 

        const incomingMessageDiv = createMessageElement(messageContent,"bot-message","thinking");   
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({top: chatBody.scrollHeight, behavior: "smooth"});
        generateBotResponse(incomingMessageDiv);
    },600);
}

// handle enter key press for sending messages
messageInput.addEventListener("keydown",(e) => {
    const userMessage = e.target.value.trim();
        if(e.key === "Enter" && userMessage){
        handleOutgoingMessage(e);
    }
});

// handle file input change and preview the seleted file
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
    fileUploadWrapper.querySelector("img").src = e.target.result;
    fileUploadWrapper.classList.add("file-uploaded");
    const base64String = e.target.result.split(",")[1];

    // store file data in userdata
        userData.file= {
        data: base64String,
        mime_type: file.type
    }
        fileInput.value = "";
    }

    reader.readAsDataURL(file);
});

//Cancel file
fileCancelButton.addEventListener("click", () => {
    userData.file= {};
    fileUploadWrapper.classList.remove("file-uploaded");
});

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());