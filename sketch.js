// =====================================================
// Motion Workspace
// Step 2 - Motion API Foundation
// =====================================================

// ----------------------------
// Variables
// ----------------------------

let connectButton;
let sendButton;
let runScriptButton;
let stopScriptButton;

let consoleDiv;

let port;
let writer;
let reader;

let decoder = new TextDecoder();

// Used later to stop scripts
let stopScript = false;


// =====================================================
// Motion API
// =====================================================

const motion = {

    // Send any G-code
    async send(command){

        await sendGcode(command);

    },

    // Home printer
    async home(){

        await sendGcode("G28");

    },

    // Relative movement
    async move(options){

        let command = "G0";

        if(options.x !== undefined){

            command += " X" + options.x;

        }

        if(options.y !== undefined){

            command += " Y" + options.y;

        }

        if(options.z !== undefined){

            command += " Z" + options.z;

        }

        if(options.feed !== undefined){

            command += " F" + options.feed;

        }

        await sendGcode(command);

    },

    // Pause
    async wait(milliseconds){

        return new Promise(resolve=>{

            setTimeout(resolve,milliseconds);

        });

    }

};


// =====================================================
// Setup
// =====================================================

function setup(){

    noCanvas();

    // Connect
    connectButton = createButton("Connect Printer");
    connectButton.parent("buttons");
    connectButton.mousePressed(connectPrinter);

    // Quick Command
    sendButton = select("#sendButton");
    sendButton.mousePressed(sendInputGcode);

    // Script buttons (HTML already has them)
    runScriptButton = select("#runScriptButton");
    stopScriptButton = select("#stopScriptButton");

    // These don't do anything yet
    runScriptButton.mousePressed(runScript);
    stopScriptButton.mousePressed(stopRunning);

    // Conversation
    consoleDiv = select("#console");

}


// =====================================================
// Connect
// =====================================================

async function connectPrinter(){

    try{

        port = await navigator.serial.requestPort();

        await port.open({

            baudRate:115200

        });

        writer = port.writable.getWriter();

        reader = port.readable.getReader();

        addMessage("Connected to printer.");

        readPrinter();

    }

    catch(error){

        console.error(error);

        addMessage("Connection failed.");

    }

}


// =====================================================
// Send G-code
// =====================================================

async function sendGcode(command){

    if(!writer){

        addMessage("Printer not connected.");

        return;

    }

    const encoder = new TextEncoder();

    await writer.write(

        encoder.encode(command + "\n")

    );

    addMessage(">> " + command);

}


// =====================================================
// Quick Command
// =====================================================

async function sendInputGcode(){

    let input = select("#gcodeInput");

    let command = input.value().trim();

    if(command=="") return;

    await sendGcode(command);

    input.value("");

    input.elt.focus();

}


// =====================================================
// Read Printer
// =====================================================

async function readPrinter(){

    while(true){

        const {value,done} = await reader.read();

        if(done){

            addMessage("Reader closed.");

            break;

        }

        let message = decoder.decode(value);

        if(message.trim()!=""){

            addMessage("<< " + message);

        }

    }

}


// =====================================================
// Script Buttons
// =====================================================

// We'll build this next
async function runScript(){

    addMessage("Running script...");

}

// We'll build this later
function stopRunning(){

    stopScript = true;

    addMessage("Stopping script...");

}


// =====================================================
// Conversation
// =====================================================

function addMessage(text){

    consoleDiv.html(

        consoleDiv.html()

        + text

        + "<br>"

    );

    consoleDiv.elt.scrollTop =
    consoleDiv.elt.scrollHeight;

}
