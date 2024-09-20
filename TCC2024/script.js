//#region -- Classes --

class Item {
    constructor(name, one_use, effect, icon) {
        this.name = name;
        this.one_use = one_use;
        this.effect = effect;
        this.icon = icon;
    }
}

class Player {
    constructor(life, max_life, atk) {
        this.life = life;
        this.max_life = max_life;
        this.atk = atk;
    }
}

class Enemy {
    constructor(name, life, atk) {
        this.name = name;
        this.life = life;
        this.atk = atk;
    }
}

//#endregion

//#region -- Constants & Lets --

const ITEMS_LIST = [
    { name: "Life potion", one_use: true, effect: () => { player.life += 10; }, icon: "images/inventory/life_potion.png" },
    { name: "Knife", one_use: false, effect: () => { player.atk = 5; }, icon: "images/inventory/knife.png" },
    { name: "Small sword", one_use: false, effect: () => { player.atk = 10; }, icon: "images/inventory/small_sword.png" },
    { name: "Big sword", one_use: false, effect: () => { player.atk = 15; }, icon: "images/inventory/big_sword.png" }
];

const ENEMIES_LIST = [
    { name: "Skeleton", life: 15, atk: 2 },
    { name: "Giant Beetle", life: 20, atk: 3 },
    { name: "Soldier", life: 30, atk: 5 },
    { name: "Golem", life: 50, atk: 7 },
]

const ROOMS_TRANSITIONS = [
    [null, null, null, 8],  // ROOMS[0] --> east to ROOMS[8]
    [null, null, null, 13], // ROOMS[1] --> east to ROOMS[13]
    [null, 21, null, null], // ROOMS[2] --> north to ROOMS[21]
    [null, null, null, 12], // ROOMS[3] --> east to ROOMS[12]
    [null, 20, null, null], // ROOMS[4] --> north to ROOMS[20]
    [null, 16, null, null], // ROOMS[5] --> north to ROOMS[16]
    [17, null, null, null], // ROOMS[6] --> west to ROOMS[17]
    [22, null, null, 15],   // ROOMS[7] --> west, east to ROOMS[15]
    [0, 13, null, 9],       // ROOMS[8] --> west, north, east to ROOMS[0, 13, 9]
    [8, null, null, 10],    // ROOMS[9] --> west, east to ROOMS[8, 10]
    [9, null, null, 11],    // ROOMS[10] --> west, east to ROOMS[9, 11]
    [10, 12, null, null],   // ROOMS[11] --> west, north to ROOMS[10, 12]
    [3, null, 11, null],    // ROOMS[12] --> west, south to ROOMS[3, 11]
    [1, 14, 8, null],       // ROOMS[13] --> west, north, south to ROOMS[1, 14, 8]
    [null, 15, 13, 16],     // ROOMS[14] --> north, south, east to ROOMS[15, 13, 16]
    [7, null, 14, null],    // ROOMS[15] --> west, south to ROOMS[7, 14]
    [14, 18, 5, 17],        // ROOMS[16] --> west, north, south, east to ROOMS[14, 18, 5, 17]
    [16, null, null, 6],    // ROOMS[17] --> west, east to ROOMS[16, 6]
    [null, 19, 16, null],   // ROOMS[18] --> north, south to ROOMS[19, 16]
    [null, null, 18, 20],   // ROOMS[19] --> south, east to ROOMS[18, 20]
    [19, null, 4, 21],      // ROOMS[20] --> west, south, east to ROOMS[19, 4, 21]
    [20, null, 2, null]     // ROOMS[21] --> west, south to ROOMS[20, 2]
];

const TV_STATES = ["menu", "playroom", "instructions", "gameOver", "youWin"];
let tvState = "menu";

let player;
let inventory = [ITEMS_LIST[1]];
let slot_selected = 0;
let password_knowledge = 0;
let room_index = 0;

// UI Elements
const PLAYER_HEALTH = document.getElementById("health"); // Get player HP display
const PLAYER_ATK = document.getElementById("attack"); // Get player ATK display
const ITEM_DISPLAY = document.getElementById("item_display"); // Get items display
const ACTIONS = $("#actions"); // Get actions display
const SAFE_INPUT = $("#safe_input"); // Get password input display

//#endregion

//#region -- Room Initialization --

let ROOMS;

function gameStart() {
    player = new Player(100, 100, 5);
    room_index = 0;
    inventory = [ITEMS_LIST[1]];
    slot_selected = 0;

    PLAYER_HEALTH.innerHTML = `LIFE: ${player.life}`;
    PLAYER_ATK.innerHTML = `ATK: ${player.atk}`;
    ITEM_DISPLAY.src = inventory[slot_selected]?.icon || "images/inventory/backpack.png";
    document.getElementById("rotation_code").style.display = "none";

    const supply_item = ITEMS_LIST[Math.floor(Math.random() * (ITEMS_LIST.length))];

    ROOMS = [
        { name: "start_room", desc: [`You started your way to the Utopia's center. It is time to end the farse! You have got a ${ITEMS_LIST[1].name} with you.`, `What are you doing? Why are you going back you stupid idiot? Return and end the farse!`], btn_states: { west: false, north: false, south: false, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "hint_room_0", desc: [`You enter inside a small room. Inside it was a small cut in half paper that was written: "74". You pick it up.`, `You enter the small room. It's now empty.`], btn_states: { west: false, north: false, south: false, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "hint_room_1", desc: [`You enter inside a very dirty room. Inside it, you found a small cut in half paper that was written: "92". You pick it up.`, `You enter the dirty room. It's now empty.`], btn_states: { west: false, north: true, south: false, east: false, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "button_room", desc: [`You enter inside a room with an only box in the corner of it. You look inside it and find a button with a "3" stamped on it. You pick it up.`, `You enter the room where you found the button. It's now empty.`], btn_states: { west: false, north: false, south: false, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "dead_pile", desc: [`You enter inside nasty looking room. A dead body pile is in your view and it makes you sick to think the leader killed all those people and used this room to dump them. Poor people...`, `You the dead body pile room. It still makes you sick.`], btn_states: { west: false, north: true, south: false, east: false, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "jeans_room", desc: [`You enter inside another room. You see a shocking scene: A man wearing only a blue jeans commited suicide with a gun, with a letter by his side which said: "remember calça jeans". You don't know what that means, but you pick it up anyways.`, `You enter the suicidal man's room. It still looks the same.`], btn_states: { west: false, north: true, south: false, east: false, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "supply_room", desc: [`You enter inside a quite messy room. There were a lot of crates in it. On one of them, you find a ${supply_item.name}`, `You enter the supply room. There is nothing useful for you anymore.`], btn_states: { west: true, north: false, south: false, east: false, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "password_room", desc: [`You enter inside a room with a big door and a password pad with 4 digits. The button 3 is missing.`, `You enter the password pad room. The button 3 is still missing.`, `You enter the password pad room. You have put the missing button on the spot it belongs, but you don't know the code.`, `You enter the password pad room and enter the code in. The door has been opened.`], btn_states: { west: true, north: false, south: false, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_0", desc: [``], btn_states: { west: true, north: true, south: false, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_1", desc: [``], btn_states: { west: true, north: false, south: false, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_2", desc: [``], btn_states: { west: true, north: false, south: false, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_3", desc: [``], btn_states: { west: true, north: true, south: false, east: false, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_4", desc: [``], btn_states: { west: true, north: false, south: true, east: false, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_5", desc: [``], btn_states: { west: true, north: true, south: true, east: false, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_6", desc: [``], btn_states: { west: false, north: true, south: true, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_7", desc: [``], btn_states: { west: true, north: false, south: true, east: false, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_8", desc: [``], btn_states: { west: true, north: true, south: true, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_9", desc: [``], btn_states: { west: true, north: false, south: false, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_10", desc: [``], btn_states: { west: false, north: true, south: true, east: false, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_11", desc: [``], btn_states: { west: false, north: false, south: true, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_12", desc: [``], btn_states: { west: true, north: false, south: true, east: true, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "corridor_13", desc: [``], btn_states: { west: true, north: false, south: true, east: false, atk: false, use: true }, enemy: null, item: null, been: 0 },
        { name: "center_room", desc: [`The leader ran away, but left his room as it was. There was a safe on his table that was labled "City Mind Control Orb". There was a note sticking out of the safe, which was written "Hint: OFF."`], btn_states: { west: false, north: false, south: false, east: false, atk: false, use: true }, enemy: null, item: null, been: 0 }
    ]

    ROOMS[6].item = new Item(supply_item.name, supply_item.one_use, supply_item.effect, supply_item.icon);

    ROOMS.slice(8, -1).forEach((room) => {
        const RNG = Math.floor(Math.random() * 100);
        const ITEM_RNG = ITEMS_LIST[Math.floor(Math.random() * (ITEMS_LIST.length))];
        const ENEMY_RNG = ENEMIES_LIST[Math.floor(Math.random() * (ENEMIES_LIST.length))];

        let description = `You enter a corridor.`;

        if (RNG <= 30) {
            description += ` You found a ${ITEM_RNG.name} on the ground and picked it up.`;
            room.desc.push(`You enter a corridor. It's cleaned up now.`);
            room.item = new Item(ITEM_RNG.name, ITEM_RNG.one_use, ITEM_RNG.effect, ITEM_RNG.icon);
        }

        if (RNG > 30 && RNG <= 60) {
            description += ` It's empty.`;
        }

        if (RNG > 60) {
            description += ` There was a ${ENEMY_RNG.name} blocking the path.`;
            room.enemy = new Enemy(ENEMY_RNG.name, ENEMY_RNG.life, ENEMY_RNG.atk);

            if (RNG > 80) {
                description += ` They were also blocking a ${ITEM_RNG.name} from you.`;
                room.item = new Item(ITEM_RNG.name, ITEM_RNG.one_use, ITEM_RNG.effect, ITEM_RNG.icon);
            }

            room.desc.push(`You enter a corridor. It's cleaned up now.`);
        }

        room.desc[0] = description;
    });
}

//#endregion

//#region -- Play Audio Function --

function playAudio(audioLink) {
    const audio = new Audio(audioLink);
    audio.play();
}

//#endregion

//#region -- Combat Functions --

function attack() {
    playAudio("sounds/attack.wav");

    const room = ROOMS[room_index];
    const enemy = room.enemy;
    if (!enemy) return;

    const P_HIT_RANDOM = Math.random();
    const E_HIT_RANDOM = Math.random();

    let p_damage = player.atk * (P_HIT_RANDOM > 0.9 ? 2 : (P_HIT_RANDOM < 0.1 ? 0 : 1));
    let e_damage = enemy.atk * (E_HIT_RANDOM > 0.9 ? 2 : (E_HIT_RANDOM < 0.1 ? 0 : 1));

    enemy.life = Math.max(0, enemy.life - p_damage);
    player.life = Math.max(0, player.life - (enemy.life > 0 ? e_damage : 0));


    // Update UI
    PLAYER_HEALTH.innerHTML = `LIFE: ${player.life}`;
    PLAYER_ATK.innerHTML = `ATK: ${player.atk}`;

    if (player.life <= 0) {
        stateChange("gameOver");
        return;
    }

    let description;

    if (enemy.life > 0) {
        description = `You have dealt ${p_damage} damage on ${enemy.name} and received ${e_damage}.`;
    } else {
        description = `You have dealt ${p_damage} damage on ${enemy.name}. They're dead now.`;

        if (room.item) {
            inventory.push(room.item);
            room.item = null;
        }

        room.enemy = null;
    }

    setRoomState(description);
}

//#endregion

//#region -- Inventory Functions --

function useItem() {
    playAudio("sounds/use.wav");

    const selected_item = inventory[slot_selected];

    selected_item.effect();

    player.life = Math.min(player.life, player.max_life);

    PLAYER_HEALTH.innerHTML = `LIFE: ${player.life}`;
    PLAYER_ATK.innerHTML = `ATK: ${player.atk}`;

    if (selected_item.one_use) {
        inventory.splice(slot_selected, 1);
        changeItem(1);
    }

}

function changeItem(dir) {
    playAudio("sounds/click.wav");
    slot_selected = (slot_selected + dir + inventory.length) % inventory.length
    ITEM_DISPLAY.src = inventory[slot_selected].icon;
}

//#endregion

//#region -- Password functions --

function submit_password() {
    const PASSWORD_INPUT = document.getElementById("password_input").value.toLowerCase();

    if (PASSWORD_INPUT == "omynapum") {
        playAudio("sounds/correct_pass.wav");
        stateChange("youWin");
    } else {
        playAudio("sounds/incorrect_pass.wav");
    }
}

//#endregion

//#region -- TV States Functions --

function stateChange(entering) {
    playAudio("sounds/click.wav");

    $("." + tvState).hide();
    $("." + entering).show();
    tvState = entering;
}

function powerButton() {
    const tv = document.getElementById("gameTv");
    const tv_on_src = "images/tvdetubo_azul.png";
    const tv_off_src = "images/tvdetubo_preta.png";

    const is_tv_on = tv.src.endsWith(tv_on_src);
    tv.src = is_tv_on ? tv_off_src : tv_on_src;

    playAudio(is_tv_on ? "sounds/turnoff.wav" : "sounds/turnon.wav");

    $("." + tvState).toggle(!is_tv_on);
    $(".off").toggle(is_tv_on);
}

//#endregion

//#region -- UI Update Functions --

function updateButtonState(btn, is_active) {
    btn.classList.toggle("active", is_active);
    btn.classList.toggle("deactive", !is_active);
}

function setRoomState(desc) {
    const room = ROOMS[room_index];
    document.getElementById("description").innerHTML = desc;

    const button_states = room.enemy ? { west: false, north: false, south: false, east: false, atk: true } : room.btn_states;
    Object.entries(button_states).forEach(([btn, is_active]) => {
        updateButtonState(document.getElementById(`${btn}Btn`), is_active);
    });

    if (!room.enemy && room.name === "password_room" && room.been === 3) {
        updateButtonState(document.getElementById(`westBtn`), true);
    }

    ACTIONS.toggle(room.name !== "center_room");
    SAFE_INPUT.toggle(room.name === "center_room");
}

//#endregion

//#region -- Main Game Logic Functions --

function inGameRooms() {
    gameStart();
    const room = ROOMS[room_index];
    setRoomState(room.desc[Math.min(room.desc.length - 1, room.been)]);
}

function changeInGameRooms(dir) {
    playAudio("sounds/click.wav");

    const current_room = ROOMS[room_index];
    const next_room = ROOMS_TRANSITIONS[room_index][dir];
    const next_room_config = ROOMS[next_room];

    if (!next_room_config) {
        console.log("ERR: Changing rooms");
        return;
    }

    // Update password knowledge
    if (current_room.name === "hint_room_0" || current_room.name === "hint_room_1") {
        if (current_room.been === 0) {
            password_knowledge++;
        }
    }

    // Update password room status
    if (current_room.name === "button_room" && ROOMS[7].been < 2) {
        ROOMS[7].been = 2;
    }

    // Marks current room as visited
    if (current_room.been < 1) {
        current_room.been = 1;
    }

    // Update password room status if knowledge is enough
    if (password_knowledge === 2 && ROOMS[7].been === 2) {
        ROOMS[7].been = 3;
    }

    // Update room index
    room_index = next_room;

    // Adds item to inventory if no enemy is encountered in the room
    if (next_room_config.item && !next_room_config.enemy) {
        inventory.push(next_room_config.item);
        next_room_config.item = null; // Removes item from room after pushed to inventory
    }

    // Makes rotation code visible if on "center_room"
    if (next_room_config.name === "center_room") {
        document.getElementById("rotation_code").style.display = "block";
    }

    setRoomState(next_room_config.desc[Math.min(next_room_config.desc.length - 1, next_room_config.been)]);
}

//#endregion
