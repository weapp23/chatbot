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
       
        const messageContent = ` <svg class="bot-avatar" fill="#000000" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill-rule="evenodd" transform="translate(0 1)"> <path d="m14 15.01h1v-8.02c0-3.862-3.134-6.991-7-6.991-3.858 0-7 3.13-7 6.991v8.02h1v-8.02c0-3.306 2.691-5.991 6-5.991 3.314 0 6 2.682 6 5.991v8.02m-10.52-13.354c-.366-.402-.894-.655-1.48-.655-1.105 0-2 .895-2 2 0 .868.552 1.606 1.325 1.883.102-.321.226-.631.371-.93-.403-.129-.695-.507-.695-.953 0-.552.448-1 1-1 .306 0 .58.138.764.354.222-.25.461-.483.717-.699m9.04-.002c.366-.401.893-.653 1.479-.653 1.105 0 2 .895 2 2 0 .867-.552 1.606-1.324 1.883-.101-.321-.225-.632-.37-.931.403-.129.694-.507.694-.952 0-.552-.448-1-1-1-.305 0-.579.137-.762.353-.222-.25-.461-.483-.717-.699"></path> <path d="m5.726 7.04h1.557v.124c0 .283-.033.534-.1.752-.065.202-.175.391-.33.566-.35.394-.795.591-1.335.591-.527 0-.979-.19-1.355-.571-.376-.382-.564-.841-.564-1.377 0-.547.191-1.01.574-1.391.382-.382.848-.574 1.396-.574.295 0 .57.06.825.181.244.12.484.316.72.586l-.405.388c-.309-.412-.686-.618-1.13-.618-.399 0-.733.138-1 .413-.27.27-.405.609-.405 1.015 0 .42.151.766.452 1.037.282.252.587.378.915.378.28 0 .531-.094.754-.283.223-.19.347-.418.373-.683h-.94v-.535m2.884.061c0-.53.194-.986.583-1.367.387-.381.853-.571 1.396-.571.537 0 .998.192 1.382.576.386.384.578.845.578 1.384 0 .542-.194 1-.581 1.379-.389.379-.858.569-1.408.569-.487 0-.923-.168-1.311-.505-.426-.373-.64-.861-.64-1.465m.574.007c0 .417.14.759.42 1.028.278.269.6.403.964.403.395 0 .729-.137 1-.41.272-.277.408-.613.408-1.01 0-.402-.134-.739-.403-1.01-.267-.273-.597-.41-.991-.41-.392 0-.723.137-.993.41-.27.27-.405.604-.405 1m-.184 3.918c.525.026.812.063.812.063.271.025.324-.096.116-.273 0 0-.775-.813-1.933-.813-1.159 0-1.923.813-1.923.813-.211.174-.153.3.12.273 0 0 .286-.037.81-.063v.477c0 .268.224.5.5.5.268 0 .5-.223.5-.498v-.252.25c0 .268.224.5.5.5.268 0 .5-.223.5-.498v-.478m-1-1.023c.552 0 1-.224 1-.5 0-.276-.448-.5-1-.5-.552 0-1 .224-1 .5 0 .276.448.5 1 .5"></path> </g> </g></svg>
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
