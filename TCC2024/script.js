//#region -- Game functions --


// -- Play audio --

function play(audioLink) {
    var audio = new Audio(audioLink);
    audio.play();
}


// Inventory

const items_list = [
    {name: "Life potion", oneUse: true, effect: () => {player.life+=10;}, icon: "images/inventory/life_potion.png"},
    {name: "Knife", oneUse: false, effect: () => {player.atk=5;}, icon: "images/inventory/knife.png"},
    {name: "Small sword", oneUse: false, effect: () => {player.atk=10;}, icon: "images/inventory/small_sword.png"},
    {name: "Big sword", oneUse: false, effect: () => {player.atk=15;}, icon: "images/inventory/big_sword.png"}
];

var inventory = [items_list[1]];
var item_selected = 0;


// Player stats

let player = {
    life: 100,
    atk: 5
}


// Player UI

const player_health = document.getElementById("health"); // Get player health display
const player_atk = document.getElementById("attack"); // Get player attack display
const item_display = document.getElementById("item_display"); // Get items display
const actions = $("#actions"); // Get actions display
const safe_input = $("#safe_input"); // Get password input display

player_health.innerHTML = `LIFE: ${player.life}`;
player_atk.innerHTML = `ATK: ${player.atk}`;
item_display.src = inventory[item_selected].icon;

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

    inventory = [items_list[1]];
    item_selected=0;
    password = Math.floor(Math.random()*(9999-1000)+1000);
    btn_missing = password.toString().slice((pass_num=Math.floor(Math.random()*3)),pass_num+1);
    supply_room_item = items_list[Math.floor(Math.random()*(items_list.length))];

    player_health.innerHTML = `LIFE: ${player.life}`;
    player_atk.innerHTML = `ATK: ${player.atk}`;
    item_display.src = inventory[item_selected].icon;
    document.getElementById("rotation_code").style="color: rgb(0,7,0);"

    cor_descs = [
        [`You started your way to the Utopia's center. It is time to end the farse! You have got a ${items_list[1].name} with you.`,`What are you doing? Why are you going back you stupid idiot? Return and end the farse!`],
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
        const item_RNG = items_list[Math.floor(Math.random()*(items_list.length))];

        rooms_items[i+8]=item_RNG;

        var description = `You enter a corridor.`;

        if (RNG>-1 && RNG<=30) {
            description += ` You found a ${item_RNG.name} on the ground and picked it up.`;
            
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
                description += ` He was also blocking a ${item_RNG.name} from you.`;

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
    const p_critical_hit = Math.random() < 0.1;
    const e_critical_hit = Math.random() < 0.1;

    let p_damage = player.atk;
    let e_damage = enemy.atk;

    if (p_critical_hit) {
        p_damage *= 2;
    }

    if (e_critical_hit) {
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

    player_health.innerHTML = `LIFE: ${player.life}`;
    player_atk.innerHTML = `ATK: ${player.atk}`;

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

    item_display.src = inventory[item_selected].icon;
}


// Submit safe password

function submit_password() {
    const password_input = document.getElementById("password_input");

    if (password_input.value.toLowerCase() == "omynapum") {
        win();
    }
}


//#endregion

//#region -- Scenarios in game --

//#region Create variables


// TV states

var tvStates = [
    "menu",
    "playroom",
    "instructions",
    "gameOver",
    "youWin"
];

var tvState = "menu";


// In game rooms

var game_rooms = [
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

var room = game_rooms[0];


// Rooms configurations

var rooms_config = [
    { desc: cor_descs[0][rooms_been[0]], btnStates: { west: false, north: false, south: false, east: true, atk: false, use: true } },
    { desc: cor_descs[1][rooms_been[1]], btnStates: { west: false, north: false, south: false, east: true, atk: false, use: true } },
    { desc: cor_descs[2][rooms_been[2]], btnStates: { west: false, north: true, south: false, east: false, atk: false, use: true } },
    { desc: cor_descs[3][rooms_been[3]], btnStates: { west: false, north: false, south: false, east: true, atk: false, use: true } },
    { desc: cor_descs[4][rooms_been[4]], btnStates: { west: false, north: true, south: false, east: false, atk: false, use: true } },
    { desc: cor_descs[5][rooms_been[5]], btnStates: { west: false, north: true, south: false, east: false, atk: false, use: true } },
    { desc: cor_descs[6][rooms_been[6]], btnStates: { west: true, north: false, south: false, east: false, atk: false, use: true } },
    { desc: cor_descs[7][rooms_been[7]], btnStates: { west: false, north: false, south: false, east: true, atk: false, use: true } },
    { desc: cor_descs[8][rooms_been[8]], btnStates: { west: true, north: true, south: false, east: true, atk: false, use: true } },
    { desc: cor_descs[9][rooms_been[9]], btnStates: { west: true, north: false, south: false, east: true, atk: false, use: true } },
    { desc: cor_descs[10][rooms_been[10]], btnStates: { west: true, north: false, south: false, east: true, atk: false, use: true } },
    { desc: cor_descs[11][rooms_been[11]], btnStates: { west: true, north: true, south: false, east: false, atk: false, use: true } },
    { desc: cor_descs[12][rooms_been[12]], btnStates: { west: true, north: false, south: true, east: false, atk: false, use: true } },
    { desc: cor_descs[13][rooms_been[13]], btnStates: { west: true, north: true, south: true, east: false, atk: false, use: true } },
    { desc: cor_descs[14][rooms_been[14]], btnStates: { west: false, north: true, south: true, east: true, atk: false, use: true } },
    { desc: cor_descs[15][rooms_been[15]], btnStates: { west: true, north: false, south: true, east: false, atk: false, use: true } },
    { desc: cor_descs[16][rooms_been[16]], btnStates: { west: true, north: true, south: true, east: true, atk: false, use: true } },
    { desc: cor_descs[17][rooms_been[17]], btnStates: { west: true, north: false, south: false, east: true, atk: false, use: true } },
    { desc: cor_descs[18][rooms_been[18]], btnStates: { west: false, north: true, south: true, east: false, atk: false, use: true } },
    { desc: cor_descs[19][rooms_been[19]], btnStates: { west: false, north: false, south: true, east: true, atk: false, use: true } },
    { desc: cor_descs[20][rooms_been[20]], btnStates: { west: true, north: false, south: true, east: true, atk: false, use: true } },
    { desc: cor_descs[21][rooms_been[21]], btnStates: { west: true, north: false, south: true, east: false, atk: false, use: true } }
];


// Set transitions between rooms

const room_transitions = [
    [null, null, null, 8],    // game_rooms[0] --> east to game_rooms[8]
    [null, null, null, 13],   // game_rooms[1] --> east to game_rooms[13]
    [null, 21, null, null],   // game_rooms[2] --> north to game_rooms[21]
    [null, null, null, 12],   // game_rooms[3] --> east to game_rooms[12]
    [null, 20, null, null],   // game_rooms[4] --> north to game_rooms[20]
    [null, 16, null, null],   // game_rooms[5] --> north to game_rooms[16]
    [17, null, null, null],   // game_rooms[6] --> west to game_rooms[17]
    [22, null, null, 15],   // game_rooms[7] --> east to game_rooms[15]
    [0, 13, null, 9],         // game_rooms[8] --> west, north, east to game_rooms[0, 13, 9]
    [8, null, null, 10],      // game_rooms[9] --> west, east to game_rooms[8, 10]
    [9, null, null, 11],      // game_rooms[10] --> west, east to game_rooms[9, 11]
    [10, 12, null, null],     // game_rooms[11] --> west, north to game_rooms[10, 12]
    [3, null, 11, null],      // game_rooms[12] --> west, south to game_rooms[3, 11]
    [1, 14, 8, null],         // game_rooms[13] --> west, north, south to game_rooms[1, 14, 8]
    [null, 15, 13, 16],       // game_rooms[14] --> north, south, east to game_rooms[15, 13, 16]
    [7, null, 14, null],      // game_rooms[15] --> west, south to game_rooms[7, 14]
    [14, 18, 5, 17],          // game_rooms[16] --> west, north, south, east to game_rooms[14, 18, 5, 17]
    [16, null, null, 6],      // game_rooms[17] --> west, east to game_rooms[16, 6]
    [null, 19, 16, null],     // game_rooms[18] --> north, south to game_rooms[19, 16]
    [null, null, 18, 20],     // game_rooms[19] --> south, east to game_rooms[18, 20]
    [19, null, 4, 21],        // game_rooms[20] --> west, south, east to game_rooms[19, 4, 21]
    [20, null, 2, null]       // game_rooms[21] --> west, south to game_rooms[20, 2]
];


//#endregion

//#region TV management


// Change TV state

function roomChange(entering) {
    $("." + tvStates[tvStates.indexOf(tvState)]).hide();
    $("." + tvStates[entering]).show();
    tvState = tvStates[entering];
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
    player_health.innerHTML = `LIFE: ${player.life}`;
    player_atk.innerHTML = `ATK: ${player.atk}`;

    var description = "";
    
    if (player.life<=0) {
        gameOver();
    }

    if (enemy.life>0) {
        description = `You have dealt ${player_damage} damage on ${enemy.name} and received ${enemy_damage}.`;
    } else {
        description = `You have dealt ${player_damage} damage on ${enemy.name}. The ${enemy.name} is dead now.`;
        
        if (rooms_events[game_rooms.indexOf(room)]==3) {
            inventory.push(rooms_items[game_rooms.indexOf(room)]);
        }
        
        rooms_events[game_rooms.indexOf(room)]=0;
    }

    setRoomState(description,rooms_config[game_rooms.indexOf(room)].btnStates);
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
    if (room=="center_room") { actions.hide(); safe_input.show(); } else { actions.show(); safe_input.hide(); }
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

    if (rooms_events[game_rooms.indexOf(room)]>1){
        for (const [btn, is_active] of Object.entries(attacked_button_states)) {
            updateButtonState(buttons[btn], is_active);

            if (enemy.life<=0) {
                enemy.life = 30;
                enemy.atk = 5;
                enemy.name = "Soldier";
            }
        }
    } else {
        for (const [btn, is_active] of Object.entries(btnStates)) {
            updateButtonState(buttons[btn], is_active);
        }

        if (room=="password_room" && rooms_been[game_rooms.indexOf(room)]==3) { updateButtonState(buttons.west, true); }
        
        updateSubmitPassword();
    }
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
    const room_index = game_rooms.indexOf(room);

    // Reset room configurations

    rooms_config = [
        { desc: cor_descs[0][rooms_been[0]], btnStates: { west: false, north: false, south: false, east: true, atk: false, use: true } },
        { desc: cor_descs[1][rooms_been[1]], btnStates: { west: false, north: false, south: false, east: true, atk: false, use: true }},
        { desc: cor_descs[2][rooms_been[2]], btnStates: { west: false, north: true, south: false, east: false, atk: false, use: true } },
        { desc: cor_descs[3][rooms_been[3]], btnStates: { west: false, north: false, south: false, east: true, atk: false, use: true } },
        { desc: cor_descs[4][rooms_been[4]], btnStates: { west: false, north: true, south: false, east: false, atk: false, use: true } },
        { desc: cor_descs[5][rooms_been[5]], btnStates: { west: false, north: true, south: false, east: false, atk: false, use: true } },
        { desc: cor_descs[6][rooms_been[6]], btnStates: { west: true, north: false, south: false, east: false, atk: false, use: true } },
        { desc: cor_descs[7][rooms_been[7]], btnStates: { west: false, north: false, south: false, east: true, atk: false, use: true } },
        { desc: cor_descs[8][rooms_been[8]], btnStates: { west: true, north: true, south: false, east: true, atk: false, use: true } },
        { desc: cor_descs[9][rooms_been[9]], btnStates: { west: true, north: false, south: false, east: true, atk: false, use: true } },
        { desc: cor_descs[10][rooms_been[10]], btnStates: { west: true, north: false, south: false, east: true, atk: false, use: true } },
        { desc: cor_descs[11][rooms_been[11]], btnStates: { west: true, north: true, south: false, east: false, atk: false, use: true } },
        { desc: cor_descs[12][rooms_been[12]], btnStates: { west: true, north: false, south: true, east: false, atk: false, use: true } },
        { desc: cor_descs[13][rooms_been[13]], btnStates: { west: true, north: true, south: true, east: false, atk: false, use: true } },
        { desc: cor_descs[14][rooms_been[14]], btnStates: { west: false, north: true, south: true, east: true, atk: false, use: true } },
        { desc: cor_descs[15][rooms_been[15]], btnStates: { west: true, north: false, south: true, east: false, atk: false, use: true } },
        { desc: cor_descs[16][rooms_been[16]], btnStates: { west: true, north: true, south: true, east: true, atk: false, use: true } },
        { desc: cor_descs[17][rooms_been[17]], btnStates: { west: true, north: false, south: false, east: true, atk: false, use: true } },
        { desc: cor_descs[18][rooms_been[18]], btnStates: { west: false, north: true, south: true, east: false, atk: false, use: true } },
        { desc: cor_descs[19][rooms_been[19]], btnStates: { west: false, north: false, south: true, east: true, atk: false, use: true } },
        { desc: cor_descs[20][rooms_been[20]], btnStates: { west: true, north: false, south: true, east: true, atk: false, use: true } },
        { desc: cor_descs[21][rooms_been[21]], btnStates: { west: true, north: false, south: true, east: false, atk: false, use: true } },
        { desc: cor_descs[22][rooms_been[22]], btnStates: { west: false, north: false, south: false, east: false, atk: false, use: false } }
    ];

    if (room_index != -1) {
        const { desc, btnStates } = rooms_config[room_index];
        setRoomState(desc, btnStates);
    } else {
        console.log("ERR: Drawing rooms");
    }
}


// Change in game rooms

function changeInGameRooms(dir) {
    const next_room = room_transitions[game_rooms.indexOf(room)][dir];

    if (next_room !== null) {
        if (room=="hint_room_0" || room=="hint_room_1") {
            if (rooms_been[game_rooms.indexOf(room)]==0) {
                password_knowledge+=1;
            }
        }

        if (room=="button_room" && rooms_been[game_rooms.indexOf("password_room")]<2) { rooms_been[game_rooms.indexOf("password_room")]=2; }

        if (rooms_been[game_rooms.indexOf(room)]<1) { rooms_been[game_rooms.indexOf(room)]=1; }

        if (password_knowledge==2 && rooms_been[game_rooms.indexOf("password_room")]==2) { rooms_been[game_rooms.indexOf("password_room")]=3; }

        room = game_rooms[next_room];

        if (rooms_events[game_rooms.indexOf(room)]==1) { inventory.push(rooms_items[game_rooms.indexOf(room)]); }

        if (room=="supply_room") { inventory.push(supply_room_item); }

        if (room=="center_room") {document.getElementById("rotation_code").style="color: white;"};

    } else {
        console.log("ERR: Changing rooms");
    }

    inGameRooms();
}

//#endregion

//#endregion
