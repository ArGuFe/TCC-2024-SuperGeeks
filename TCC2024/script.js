//#region -- Game functions --

// Constants

const ITEMS_LIST = [
    {name: "Life potion", oneUse: true, effect: () => {player.life+=10;}, icon: "images/inventory/life_potion.png"},
    {name: "Knife", oneUse: false, effect: () => {player.atk=5;}, icon: "images/inventory/knife.png"},
    {name: "Small sword", oneUse: false, effect: () => {player.atk=10;}, icon: "images/inventory/small_sword.png"},
    {name: "Big sword", oneUse: false, effect: () => {player.atk=15;}, icon: "images/inventory/big_sword.png"}
];

const PLAYER_HEALTH = document.getElementById("health"); // Get player health display
const PLAYER_ATK = document.getElementById("attack"); // Get player attack display
const ITEM_DISPLAY = document.getElementById("item_display"); // Get items display
const ACTIONS = $("#actions"); // Get actions display
const SAFE_INPUT = $("#safe_input"); // Get password input display


const TV_STATES = [
    "menu",
    "playroom",
    "instructions",
    "gameOver",
    "youWin"
];

const GAME_ROOMS = [
    "start_room",
    "hint_room_0",
    "hint_room_1",
    "button_room",
    "deadpile_room",
    "jeans_room",
    "supply_room",
    "password_room",
    "corridor_0",
    "corridor_1",
    "corridor_2",
    "corridor_3",
    "corridor_4",
    "corridor_5",
    "corridor_6",
    "corridor_7",
    "corridor_8",
    "corridor_9",
    "corridor_10",
    "corridor_11",
    "corridor_12",
    "corridor_13",
    "center_room"
];

const ROOMS_PATHS = [
    {west: false, north: false, south: false, east: true, atk: false, use: true},    // GAME_ROOMS[0] --> east
    {west: false, north: false, south: false, east: true, atk: false, use: true},    // GAME_ROOMS[1] --> east
    {west: false, north: true, south: false, east: false, atk: false, use: true},    // GAME_ROOMS[2] --> north
    {west: false, north: false, south: false, east: true, atk: false, use: true},    // GAME_ROOMS[3] --> east
    {west: false, north: true, south: false, east: false, atk: false, use: true},    // GAME_ROOMS[4] --> north
    {west: false, north: true, south: false, east: false, atk: false, use: true},    // GAME_ROOMS[5] --> north
    {west: true, north: false, south: false, east: false, atk: false, use: true},    // GAME_ROOMS[6] --> west
    {west: false, north: false, south: false, east: true, atk: false, use: true},     // GAME_ROOMS[7] --> east
    {west: true, north: true, south: false, east: true, atk: false, use: true},    // GAME_ROOMS[8] --> west, north, east
    {west: true, north: false, south: false, east: true, atk: false, use: true},    // GAME_ROOMS[9] --> west, east
    {west: true, north: false, south: false, east: true, atk: false, use: true},    // GAME_ROOMS[10] --> west, east
    {west: true, north: true, south: false, east: false, atk: false, use: true},    // GAME_ROOMS[11] --> west, north
    {west: true, north: false, south: true, east: false, atk: false, use: true},    // GAME_ROOMS[12] --> west, south
    {west: true, north: true, south: true, east: false, atk: false, use: true},    // GAME_ROOMS[13] --> west, north, south
    {west: false, north: true, south: true, east: true, atk: false, use: true},    // GAME_ROOMS[14] --> north, south, east
    {west: true, north: false, south: true, east: false, atk: false, use: true},    // GAME_ROOMS[15] --> west, south
    {west: true, north: true, south: true, east: true, atk: false, use: true},    // GAME_ROOMS[16] --> west, north, south, east
    {west: true, north: false, south: false, east: true, atk: false, use: true},    // GAME_ROOMS[17] --> west, east
    {west: false, north: true, south: true, east: false, atk: false, use: true},    // GAME_ROOMS[18] --> north, south
    {west: false, north: false, south: true, east: true, atk: false, use: true},    // GAME_ROOMS[19] --> south, east
    {west: true, north: false, south: true, east: true, atk: false, use: true},    // GAME_ROOMS[20] --> west, south, east
    {west: true, north: false, south: true, east: false, atk: false, use: true},    // GAME_ROOMS[21] --> west, south
];

const room_transitions = [
    [null, null, null, 8],  // GAME_ROOMS[0] --> east to GAME_ROOMS[8]
    [null, null, null, 13], // GAME_ROOMS[1] --> east to GAME_ROOMS[13]
    [null, 21, null, null], // GAME_ROOMS[2] --> north to GAME_ROOMS[21]
    [null, null, null, 12], // GAME_ROOMS[3] --> east to GAME_ROOMS[12]
    [null, 20, null, null], // GAME_ROOMS[4] --> north to GAME_ROOMS[20]
    [null, 16, null, null], // GAME_ROOMS[5] --> north to GAME_ROOMS[16]
    [17, null, null, null], // GAME_ROOMS[6] --> west to GAME_ROOMS[17]
    [22, null, null, 15],   // GAME_ROOMS[7] --> west, east to GAME_ROOMS[15]
    [0, 13, null, 9],       // GAME_ROOMS[8] --> west, north, east to GAME_ROOMS[0, 13, 9]
    [8, null, null, 10],    // GAME_ROOMS[9] --> west, east to GAME_ROOMS[8, 10]
    [9, null, null, 11],    // GAME_ROOMS[10] --> west, east to GAME_ROOMS[9, 11]
    [10, 12, null, null],   // GAME_ROOMS[11] --> west, north to GAME_ROOMS[10, 12]
    [3, null, 11, null],    // GAME_ROOMS[12] --> west, south to GAME_ROOMS[3, 11]
    [1, 14, 8, null],       // GAME_ROOMS[13] --> west, north, south to GAME_ROOMS[1, 14, 8]
    [null, 15, 13, 16],     // GAME_ROOMS[14] --> north, south, east to GAME_ROOMS[15, 13, 16]
    [7, null, 14, null],    // GAME_ROOMS[15] --> west, south to GAME_ROOMS[7, 14]
    [14, 18, 5, 17],        // GAME_ROOMS[16] --> west, north, south, east to GAME_ROOMS[14, 18, 5, 17]
    [16, null, null, 6],    // GAME_ROOMS[17] --> west, east to GAME_ROOMS[16, 6]
    [null, 19, 16, null],   // GAME_ROOMS[18] --> north, south to GAME_ROOMS[19, 16]
    [null, null, 18, 20],   // GAME_ROOMS[19] --> south, east to GAME_ROOMS[18, 20]
    [19, null, 4, 21],      // GAME_ROOMS[20] --> west, south, east to GAME_ROOMS[19, 4, 21]
    [20, null, 2, null]     // GAME_ROOMS[21] --> west, south to GAME_ROOMS[20, 2]
];

// -- Play audio --

function play(audioLink) {
    var audio = new Audio(audioLink);
    audio.play();
}


// Inventory

var inventory = [ITEMS_LIST[1]];
var item_selected = 0;


// Player stats

let player = {
    life: 100,
    atk: 5
}


// Player UI


PLAYER_HEALTH.innerHTML = `LIFE: ${player.life}`;
PLAYER_ATK.innerHTML = `ATK: ${player.atk}`;
ITEM_DISPLAY.src = inventory[item_selected].icon;

// Enemy stats

let enemy = {
    life: 30,
    atk: 5,
    name: "Soldier"
}


// Room events

var rooms_been = Array(23).fill(0); // Number of room description
var rooms_events = Array(23).fill(0); // Room events numbered [0 -> Empty; 1 -> Item; 2 -> Enemy; 3 -> Item & Enemy]
var rooms_items = Array(23).fill(0); // Items in each room
var cor_descs = Array(23);


// Game RNG

var password = 0; // From password room
var btn_missing = 0; // Button missing from password room
var supply_room_item = 0; // Item found in supply room
var password_knowledge = 0; // The password knowledge level


// Starting game

function game_start() {
    room = "start_room";
    rooms_been.fill(0);
    rooms_events.fill(0);
    rooms_items.fill(0);

    player.life=50;
    player.atk=5;

    enemy.life=30;

    inventory = [ITEMS_LIST[1]];
    item_selected=0;
    password = Math.floor(Math.random()*(9999-1000)+1000);
    btn_missing = password.toString().slice((pass_num=Math.floor(Math.random()*3)),pass_num+1);
    supply_room_item = ITEMS_LIST[Math.floor(Math.random()*(ITEMS_LIST.length))];

    PLAYER_HEALTH.innerHTML = `LIFE: ${player.life}`;
    PLAYER_ATK.innerHTML = `ATK: ${player.atk}`;
    ITEM_DISPLAY.src = inventory[item_selected].icon;
    document.getElementById("rotation_code").style="color: rgb(0,7,0);"

    cor_descs = [
        [`You started your way to the Utopia's center. It is time to end the farse! You have got a ${ITEMS_LIST[1].name} with you.`,`What are you doing? Why are you going back you stupid idiot? Return and end the farse!`],
        [`You enter inside a small room. Inside it was a small cut in half paper that was written: "${password.toString().slice(0,2)}". You pick it up.`,`You re-enter the small room. It's now empty.`],
        [`You enter inside a very dirty room. Inside it, you found a small cut in half paper that was written: "${password.toString().slice(2,4)}". You pick it up.`,`You re-enter the dirty room. It's now empty.`],
        [`You enter inside a room with an only box in the corner of it. You look inside it and find a button with a "${btn_missing}" stamped on it. You pick it up.`,`You re-enter the room where you found the button. It's now empty.`],
        [`You enter inside nasty looking room. A dead body pile is in your view and it makes you sick to think the leader killed all those people and used this room to dump them. Poor people...`,`You the dead body pile room. It still makes you sick.`],
        [`You enter inside another room. You see a shocking scene: A man wearing only a blue jeans commited suicide with a gun, with a letter by his side which said: "remember calça jeans". You don"t know what that means, but you pick it up anyways.`,`You re-enter the suicidal man's room. It still looks the same.`],
        [`You enter inside a quite messy room. There were a lot of crates in it. On one of them, you find a ${supply_room_item.name}`, `You re-enter the supply room. There is nothing useful for you anymore.`],
        [`You enter inside a room with a big door and a password pad with 4 digits. The button ${btn_missing} is missing.`,`You re-enter the password pad room. The button ${btn_missing} is still missing.`,`You re-enter the password pad room. You have put the missing button on the spot it belongs, but you don"t know the code.`, `You enter the password pad room and enter the code in. The door has been opened.`],
        [``,``],
        [``,``],
        [``,``],
        [``,``],
        [``,``],
        [``,``],
        [``,``],
        [``,``],
        [``,``],
        [``,``],
        [``,``],
        [``,``],
        [``,``],
        [``,``],
        [`The leader ran away, but left his room as it was. There was a safe on his table that was labled "City Mind Control Orb". There was a note sticking out of the safe, which was written "Hint: OFF."`]
    ];


    // Decide RNG for each room

    for (var i=0;i<cor_descs.length-9;i++) {
        const RNG = Math.floor(Math.random()*100);
        const ITEM_RNG = ITEMS_LIST[Math.floor(Math.random()*(ITEMS_LIST.length))];

        rooms_items[i+8]=ITEM_RNG;

        var description = `You enter a corridor.`;

        if (RNG>-1 && RNG<=30) {
            description += ` You found a ${ITEM_RNG.name} on the ground and picked it up.`;
            
            rooms_events[i+8]=1;
            cor_descs[i+8][1] = `You enter a corridor. It's cleaned up now.`;
        }
        
        if (RNG>30 && RNG<=60) {
            description += ` It's empty.`;

            cor_descs[i+8][1] = description;
        }
        
        if (RNG>60) {
            description += ` There was a ${enemy.name} blocking the path.`;

            rooms_events[i+8]=2;

            if (RNG>80) {
                description += ` He was also blocking a ${ITEM_RNG.name} from you.`;

                rooms_events[i+8]=3;
            }

            cor_descs[i+8][1] = `You enter a corridor. It's cleaned up now.`;
        }

        cor_descs[i+8][0] = description;
    }
}

game_start();

// Attacking

function attack() {
    const P_CRITICAL_HIT = Math.random() < 0.1;
    const E_CRITICAL_HIT = Math.random() < 0.1;

    let p_damage = player.atk;
    let e_damage = enemy.atk;

    if (P_CRITICAL_HIT) {
        p_damage *= 2;
    }

    if (E_CRITICAL_HIT) {
        e_damage *= 2;
    }

    enemy.life-=p_damage;

    if (enemy.life>0) {
        player.life-=e_damage;
    }

    update_fight_ui(p_damage, e_damage, enemy);
}


// Use

function use_item() {
    inventory[item_selected].effect();

    if (player.life>50) {
        player.life=50;
    }

    PLAYER_HEALTH.innerHTML = `LIFE: ${player.life}`;
    PLAYER_ATK.innerHTML = `ATK: ${player.atk}`;

    if (inventory[item_selected].oneUse==true){
        inventory.splice(item_selected,1);
        change_item(1);
    }
}

// Change item

function change_item(dir) {
    item_selected+=dir;

    if (item_selected>inventory.length-1) {
        item_selected=0;
    } else if (item_selected<0) {
        item_selected=inventory.length-1;
    }

    ITEM_DISPLAY.src = inventory[item_selected].icon;
}


// Submit safe password

function submit_password() {
    const PASSWORD_INPUT = document.getElementById("password_input");

    if (PASSWORD_INPUT.value.toLowerCase() == "omynapum") {
        win();
    }
}


//#endregion

//#region -- Scenarios in game --

//#region Create variables


// TV states

var tvState = "menu";


// In game rooms

var room = GAME_ROOMS[0];


// Rooms configurations

const ROOMS_CONFIG = [];

for (var i=0; i<GAME_ROOMS.length; i++) {
    ROOMS_CONFIG.push({ desc: cor_descs[i][rooms_been[i]], btnStates: ROOMS_PATHS[i] });
}

//#endregion

//#region TV management


// Change TV state

function roomChange(entering) {
    $("." + TV_STATES[TV_STATES.indexOf(tvState)]).hide();
    $("." + TV_STATES[entering]).show();
    tvState = TV_STATES[entering];
}

// Turn TV off/on

function powerButton() {
    var tv = document.getElementById("gameTv");

    if (tv.src.endsWith("images/tvdetubo_azul.png")) {
        tv.src = "images/tvdetubo_preta.png";
        $("." + tvState).hide();
        $(".off").show();
        play("sounds/turnoff.wav");
    } else if (tv.src.endsWith("images/tvdetubo_preta.png")) {
        tv.src = "images/tvdetubo_azul.png";
        $("." + tvState).show();
        $(".off").hide();
        play("sounds/turnon.wav");
    }
}


// Game over

function gameOver() {    
    roomChange(3);
}

// Win

function win() {    
    roomChange(4);
}


//#endregion

//#region Room management


// Update UI

function update_fight_ui(player_damage, enemy_damage) {
    PLAYER_HEALTH.innerHTML = `LIFE: ${player.life}`;
    PLAYER_ATK.innerHTML = `ATK: ${player.atk}`;

    var description = "";
    
    if (player.life<=0) {
        gameOver();
    }

    if (enemy.life>0) {
        description = `You have dealt ${player_damage} damage on ${enemy.name} and received ${enemy_damage}.`;
    } else {
        description = `You have dealt ${player_damage} damage on ${enemy.name}. The ${enemy.name} is dead now.`;
        
        if (rooms_events[GAME_ROOMS.indexOf(room)]==3) {
            inventory.push(rooms_items[GAME_ROOMS.indexOf(room)]);
        }
        
        rooms_events[GAME_ROOMS.indexOf(room)]=0;
    }

    setRoomState(description,ROOMS_CONFIG[GAME_ROOMS.indexOf(room)].btnStates);
}


// Update button

function updateButtonState(btn, is_active) {
    if (is_active) {
        btn.classList.remove("deactive");
        btn.classList.add("active");
    } else {
        btn.classList.remove("active");
        btn.classList.add("deactive");
    }
}

function updateSubmitPassword() {
    if (room=="center_room") { ACTIONS.hide(); SAFE_INPUT.show(); } else { ACTIONS.show(); SAFE_INPUT.hide(); }
}


// Set the room you are in

function setRoomState(desc, btnStates) {
    const room_desc = document.getElementById("description");
    room_desc.innerHTML = desc;

    const buttons = {
        west: document.getElementById("westBtn"),
        north: document.getElementById("northBtn"),
        south: document.getElementById("southBtn"),
        east: document.getElementById("eastBtn"),
        atk: document.getElementById("atkBtn"),
        use: document.getElementById("useBtn")
    };

    const attacked_button_states = setButtonBeingAttacked();

    if (rooms_events[GAME_ROOMS.indexOf(room)]>1){
        for (const [btn, is_active] of Object.entries(attacked_button_states)) {
            updateButtonState(buttons[btn], is_active);

            if (enemy.life<=0) {
                enemy.life = 30;
                enemy.atk = 5;
                enemy.name = "Soldier";
            }
        }
    } else {
        if (room!="center_room"){
            for (const [btn, is_active] of Object.entries(btnStates)) {
                updateButtonState(buttons[btn], is_active);
            }

            if (room=="password_room" && rooms_been[GAME_ROOMS.indexOf(room)]==3) { updateButtonState(buttons.west, true); }
        }
    }

    updateSubmitPassword();
}


// Set buttons if in fight situation

function setButtonBeingAttacked() {
    return {
        west: false,
        north: false,
        south: false,
        east: false,
        atk: true
    };
}


// Create game rooms

function inGameRooms() {
    const room_index = GAME_ROOMS.indexOf(room);

    // Reset room configurations

    ROOMS_CONFIG.length = 0;

    for (var i=0; i<GAME_ROOMS.length; i++) {
        ROOMS_CONFIG.push({desc: cor_descs[i][rooms_been[i]], btnStates: ROOMS_PATHS[i]});
    }

    if (room_index != -1) {
        const { desc, btnStates } = ROOMS_CONFIG[room_index];
        setRoomState(desc, btnStates);
    } else {
        console.log("ERR: Drawing rooms");
    }
}


// Change in game rooms

function changeInGameRooms(dir) {
    const next_room = room_transitions[GAME_ROOMS.indexOf(room)][dir];

    if (next_room !== null) {
        if (room=="hint_room_0" || room=="hint_room_1") {
            if (rooms_been[GAME_ROOMS.indexOf(room)]==0) {
                password_knowledge+=1;
            }
        }

        if (room=="button_room" && rooms_been[GAME_ROOMS.indexOf("password_room")]<2) { rooms_been[GAME_ROOMS.indexOf("password_room")]=2; }

        if (rooms_been[GAME_ROOMS.indexOf(room)]<1) { rooms_been[GAME_ROOMS.indexOf(room)]=1; }

        if (password_knowledge==2 && rooms_been[GAME_ROOMS.indexOf("password_room")]==2) { rooms_been[GAME_ROOMS.indexOf("password_room")]=3; }

        room = GAME_ROOMS[next_room];

        if (rooms_events[GAME_ROOMS.indexOf(room)]==1) { inventory.push(rooms_items[GAME_ROOMS.indexOf(room)]); }

        if (room=="supply_room") { inventory.push(supply_room_item); }

        if (room=="center_room") {document.getElementById("rotation_code").style="color: white;"};

    } else {
        console.log("ERR: Changing rooms");
    }

    inGameRooms();
}

//#endregion

//#endregion
