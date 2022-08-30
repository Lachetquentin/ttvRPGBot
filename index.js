const tmi = require('tmi.js');
const start_time = time();
const prefix = '=';

const options = {
    options: {
        debug: true,
    },
    connection: {
        cluster: "aws",
        reconnect: true,
    },
    identity: {
        username: "",
        password: "",
    },
    channels: [""],
};

const client = new tmi.client(options);

const monsterNames = ["Lutin démoniaque", "Loup-garou malicieux", "Dragon terrifiant", "Bandit tenace"];

var playerInBattle = [];

var monsterHasSpawned = false;

var pvpIsOn = false;
var playerInPvp = [];

const hats = [{
    name: "Le Chat-Pot",
    category: "Chapeau",
    rarity: "Légendaire",
    healthBonus: 30,
    armorBonus: 10,
},]

const amulets = [{
    name: "Le Colle-ier",
    category: "Amulette",
    rarity: "Commun",
    healthBonus: 5,
    armorBonus: 1,
},]

const weapons = [{
    name: "Vengeance",
    category: "Arme",
    rarity: "Légendaire",
    attackBonus: 30,
},
{
    name: "Destruction",
    category: "Arme",
    rarity: "Légendaire",
    attackBonus: 32,
},
{
    name: "Profanateur",
    category: "Arme",
    rarity: "Mythique",
    attackBonus: 20,
}
]

const shields = [{
    name: "Protecteur",
    category: "Bouclier",
    rarity: "Légendaire",
    healthBonus: 30,
    armorBonus: 10,
},
{
    name: "Gardien",
    category: "Bouclier",
    rarity: "Mythique",
    healthBonus: 20,
    armorBonus: 5,
},
{
    name: "Mastodonte",
    category: "Bouclier",
    rarity: "Commun",
    healthBonus: 10,
    armorBonus: 3,
}
]

const rings = [{
    name: "Prison",
    category: "Anneau",
    rarity: "Commun",
    healthBonus: 3,
    armorBonus: 1,
},
{
    name: "Le Dos-Nuts",
    category: "Anneau",
    rarity: "Légendaire",
    healthBonus: 15,
    armorBonus: 3,
}
]

const cloaks = [{
    name: "La Carpe",
    category: "Cape",
    rarity: "Commun",
    healthBonus: 5,
    armorBonus: 2,
},
{
    name: "Tapis Rouge",
    category: "Cape",
    rarity: "Commun",
    healthBonus: 2,
    armorBonus: 1,
}
]

const belts = [{
    name: "La Cent-ture",
    category: "Ceinture",
    rarity: "Commun",
    healthBonus: 5,
    armorBonus: 3,
},
{
    name: "La Corde",
    category: "Ceinture",
    rarity: "Commun",
    healthBonus: 2,
    armorBonus: 1,
}
]

const pets = [{
    name: "",
    race: "Dragon",
    category: "Familier",
    rarity: "Légendaire",
    attackBonus: 25,
    healthBonus: 0,
},
{
    name: "",
    race: "Tortue",
    category: "Familier",
    rarity: "Légendaire",
    attackBonus: 0,
    healthBonus: 25,
},
{
    name: "",
    race: "Tigreau",
    category: "Familier",
    rarity: "Mythique",
    attackBonus: 15,
    healthBonus: 0,
},
{
    name: "",
    race: "Aigle",
    category: "Familier",
    rarity: "Mythique",
    attackBonus: 10,
    healthBonus: 0,
},
{
    name: "",
    race: "Chat",
    category: "Familier",
    rarity: "Commun",
    attackBonus: 0,
    healthBonus: 5,
},
{
    name: "",
    race: "Chien",
    category: "Familier",
    rarity: "Commun",
    attackBonus: 5,
    healthBonus: 0,
},

]

const boots = [{
    name: "Bot-tines",
    category: "Bottes",
    rarity: "Mythique",
    healthBonus: 10,
    armorBonus: 10,
},
{
    name: "Les Beauttes",
    category: "Bottes",
    rarity: "Commun",
    healthBonus: 3,
    armorBonus: 2,
}
]

const relics = [{
    name: "Bol de Couscous",
    category: "Relique",
    rarity: "Légendaire",
    attackBonus: 0,
    healthBonus: 20,
},
{
    name: "Badge AK",
    category: "Relique",
    rarity: "Légendaire",
    attackBonus: 0,
    healthBonus: 20,
}
]

const player = {
    maxHealth: 10,
    health: 10,
    level: 1,
    experience: 0,
    attack: 1,
    armor: 0,
    objets: [],
    name: "",
    twitchId: 0,
    hasAttacked: false,
};

const monster = {
    health: 10,
    level: 1,
    attack: 1,
    name: "",
};

const bosses = [{
    name: "Chef des orcs",
    health: 100,
    attack: 10,
},
{
    name: "Capitaine des Bandits",
    health: 100,
    attack: 10,
},
{
    name: "Mage noir",
    health: 100,
    attack: 10,
}
]

const game = {
    players: [],
    objet: null,
    monster: null,
    queuing: false,
    active: false
};

const lvlExp = {
    1: 0,
    2: 500,
    3: 1100,
    4: 2000,
    5: 3500,
    6: 5500,
    7: 8500,
    8: 13000,
    9: 19000,
    10: 27000,
};

const maxLvlExp = parseInt(Object.keys(lvlExp)[Object.keys(lvlExp).length - 1]);

function time() {
    return Math.floor(new Date().getTime() / 1000);
}

function uptime(channel) {
    var t = time() - start_time;
    var s = t % 60;
    t = (t - s) / 60;
    var m = t % 60;
    t = (t - m) / 60;
    var h = t;

    client.action(channel, ":alarm_clock: RPGBot démarré depuis " + h + "h " + m + "m " + s + "s");
}

function checkIfExists(user) {
    const alreadyExists = game.players.find(e => user["user-id"] === e.twitchId);

    return alreadyExists;
}

function checkIfInBattle(user) {

    // Vérifie si le joueur existe déjà dans les joueurs qui sont dans le combat.
    const alreadyExists = playerInBattle.find(e => user["user-id"] === e.twitchId);

    // Si il existe déjà retourne rien et termine la fonction.
    if (alreadyExists) {
        return;
    }

    // Sinon on cherche l'ID du joueur qui correspond à l'ID du message et on récupère ses stats.
    const playerStats = game.players.find(e => user["user-id"] === e.twitchId);

    // Et on l'ajoute au tableau des joueurs qui sont dans le combat.
    playerInBattle.push(playerStats);

}

function createPlayer(user) {

    if (checkIfExists(user)) {
        return;
    }

    const createdPlayer = {
        ...player
    };
    createdPlayer.name = user["display-name"];
    createdPlayer.twitchId = user["user-id"];

    game.players.push(createdPlayer);
}

function checkStats(user, channel) {
    var playerStats = game.players.find(e => user["user-id"] === e.twitchId);

    client.say(channel, "🔥 Vous êtes niveau " + playerStats.level + " avec " + playerStats.experience + "/" + lvlExp[playerStats.level + 1] + " d'EXP✨, vous avez " + playerStats.health + " ❤️PV, une ATK⚡️ de " + playerStats.attack + " et " + playerStats.armor + " d'armure🛡️ !");
}

// Only for testings purpose. Inventory will be on website only.
function checkInventory(user, channel) {
    var msg = "";
    var playerStats = game.players.find(e => user["user-id"] === e.twitchId);

    if (!playerStats.objets[0]) {
        client.say(channel, "🔥 Vous ne possèdez aucun objet dans votre inventaire !");
        return;
    }

    playerStats.objets.forEach(element => {
        if (element.category === "Familier") {
            msg += element.race + ", ";
        } else {
            msg += element.name + ", ";
        }

    });

    client.say(channel, "🔥 Dans votre inventaire, vous possèdez : " + msg + " !");
}

function createMonster(channel) {
    var roll, level, attack, health, name;

    roll = Math.floor(Math.random() * 100);
    if (roll >= 0 && roll < 1)
        level = 10;
    else if (roll >= 1 && roll < 3)
        level = 9;
    else if (roll >= 3 && roll < 6)
        level = 8;
    else if (roll >= 6 && roll < 10)
        level = 7;
    else if (roll >= 10 && roll < 15)
        level = 6;
    else if (roll >= 15 && roll < 22)
        level = 5;
    else if (roll >= 22 && roll < 32)
        level = 4;
    else if (roll >= 32 && roll < 47)
        level = 3;
    else if (roll >= 47 && roll < 68)
        level = 2;
    else
        level = 1;

    attack = 1 + 2 * level;
    health = Math.pow(2, level) + 10;

    roll = Math.floor(Math.random() * monsterNames.length);
    name = monsterNames[roll];

    var createdMonster = monster;
    createdMonster.level = level;
    createdMonster.health = health;
    createdMonster.attack = attack;
    createdMonster.name = name;
    createdMonster.hasSpawned = true;
    game.monster = createdMonster;

    client.say(channel, "🔥 Un " + game.monster.name + " de niveau " + game.monster.level + " vient d’apparaître ! Écrivez " + `${prefix}` + "bagarre pour rejoindre le combat et avoir une chance de recevoir du loot ! (" + game.monster.health + " ❤️PV)");
}

function randomBoss(user, channel) {
    var roll, randomBoss;

    if (escapeTimerIsOn === false) {
        escape(user, channel);
    }

    roll = Math.floor(Math.random() * bosses.length);

    randomBoss = bosses[roll];
    monsterHasSpawned = true;

    game.monster = {
        ...randomBoss
    };

    client.say(channel, "🔥 Un " + game.monster.name + " vient d’apparaître ! Écrivez " + `${prefix}` + "bagarre pour rejoindre le combat et avoir une chance de recevoir du loot ! (" + game.monster.health + " ❤️PV)");
}

function randomItem() {
    var roll, randomItem;

    roll = Math.floor(Math.random() * 10);

    switch (roll) {
        case 0:
            roll = Math.floor(Math.random() * hats.length);

            randomItem = hats[roll];

            break;

        case 1:
            roll = Math.floor(Math.random() * amulets.length);

            randomItem = amulets[roll];

            break;

        case 2:
            roll = Math.floor(Math.random() * weapons.length);

            randomItem = weapons[roll];

            break;

        case 3:
            roll = Math.floor(Math.random() * shields.length);

            randomItem = shields[roll];

            break;

        case 4:
            roll = Math.floor(Math.random() * rings.length);

            randomItem = rings[roll];

            break;

        case 5:
            roll = Math.floor(Math.random() * cloaks.length);

            randomItem = cloaks[roll];

            break;

        case 6:
            roll = Math.floor(Math.random() * belts.length);

            randomItem = belts[roll];

            break;

        case 7:
            roll = Math.floor(Math.random() * pets.length);

            randomItem = pets[roll];

            break;

        case 8:
            roll = Math.floor(Math.random() * boots.length);

            randomItem = boots[roll];

            break;

        case 9:
            roll = Math.floor(Math.random() * relics.length);

            randomItem = relics[roll];

            break;

        default:
            break;
    }

    game.objet = randomItem;

}

function randomAddItem(channel) {
    var roll, playerLoot, rarity;

    //Génère un nombre random entre 0 et le nombre de joueur présent dans le combat
    roll = Math.floor(Math.random() * playerInBattle.length);

    //Récupére le joueur selectionné par le roll dans le tableau de playerInBattle puis push l'objet dans son inventaire.
    playerLoot = playerInBattle[roll];   
    playerLoot.objets = playerLoot.objets.concat([game.objet]);

    rarity = game.objet.rarity;

    switch (rarity) {
        case "Commun":
            if (game.objet.category === "Familier") {
                client.say(channel, "🔥 " + `@${playerLoot.name}` + " a obtenu(e) 🟢 un " + game.objet.category + " : " + game.objet.race + " de rareté " + game.objet.rarity + " !");
            } else {
                client.say(channel, "🔥 " + `@${playerLoot.name}` + " a obtenu(e) 🟢 " + game.objet.name + " : " + game.objet.category + " de rareté " + game.objet.rarity + " !");
            }
            break;

        case "Mythique":
            if (game.objet.category === "Familier") {
                client.say(channel, "🔥 " + `@${playerLoot.name}` + " a obtenu(e) 🟣 un " + game.objet.category + " : " + game.objet.race + " de rareté " + game.objet.rarity + " !");
            } else {
                client.say(channel, "🔥 " + `@${playerLoot.name}` + " a obtenu(e) 🟣 " + game.objet.name + " : " + game.objet.category + " de rareté " + game.objet.rarity + " !");
            }
            break;

        case "Légendaire":
            if (game.objet.category === "Familier") {
                client.say(channel, "🔥 " + `@${playerLoot.name}` + " a obtenu(e) 🟡 un " + game.objet.category + " : " + game.objet.race + " de rareté " + game.objet.rarity + " !");
            } else {
                client.say(channel, "🔥 " + `@${playerLoot.name}` + " a obtenu(e) 🟡 " + game.objet.name + " : " + game.objet.category + " de rareté " + game.objet.rarity + " !");
            }
            break;

        case "debug":
            if (game.objet.category === "Familier") {
                client.say(channel, "🔥 " + `@${playerLoot.name}` + " a obtenu(e) ⚫ un " + game.objet.category + " : " + game.objet.race + " de rareté " + game.objet.rarity + " !");
            } else {
                client.say(channel, "🔥 " + `@${playerLoot.name}` + " a obtenu(e) ⚫ " + game.objet.name + " : " + game.objet.category + " de rareté " + game.objet.rarity + " !");
            }
            break;

        default:
            break;
    }

}

var totalDmg = 0;

function bagarre(user, channel) {
    var dmg;

    if (monsterHasSpawned == false) {
        client.say(channel, "🔥 Aucun monstre n'est présent !");
        return false;
    }

    const player = game.players.find(e => user["user-id"] === e.twitchId);

    if (player.hasAttacked === true) {
        client.say(channel, "🔥 Vous avez déjà rejoint le combat !");
    } else {
        if (game.monster.health >= 1) {

            player.hasAttacked = true;
            dmg = rnd(10 + (player.attack) * 3);

            game.monster.health -= dmg;

            totalDmg += dmg;

            if (game.monster.health <= 0) {

                randomItem();

                var rarity = game.objet.rarity;

                switch (rarity) {
                    case "Commun":
                        client.say(channel, "🔥 " + game.monster.name + " est mort 💀. Le groupe à infligé " + totalDmg + " dégâts. Il a laissé par terre 🟢 " + game.objet.category + " de rareté " + game.objet.rarity + " !");
                        break;

                    case "Mythique":
                        client.say(channel, "🔥 " + game.monster.name + " est mort 💀. Le groupe à infligé " + totalDmg + " dégâts. Il a laissé par terre 🟣 " + game.objet.category + " de rareté " + game.objet.rarity + " !");
                        break;

                    case "Légendaire":
                        client.say(channel, "🔥 " + game.monster.name + " est mort 💀. Le groupe à infligé " + totalDmg + " dégâts. Il a laissé par terre 🟡  " + game.objet.category + " de rareté " + game.objet.rarity + " !");
                        break;

                    case "debug":
                        client.say(channel, "🔥 " + game.monster.name + " est mort 💀. Le groupe à infligé " + totalDmg + " dégâts. Il a laissé par terre ⚫  " + game.objet.category + " de rareté " + game.objet.rarity + " !");

                    default:
                        break;
                }

                calculateExp(channel);
                randomAddItem(channel);

                game.monster = null;
                monsterHasSpawned = false;
                player.hasAttacked = false;
                playerInBattle = [];
            } else {
                client.say(channel, "🔥 " + `@${player.name}` + " a rejoint le combat !");
            }
            checkIfInBattle(user);
        }
    }
}

function pvp(user, channel, message) {

    if (pvpIsOn === false) {
        try {
            var username = message.split(' ')[1].trim();
            console.log(username);
            var usernameSplit = message.split('@')[1].trim();
            console.log(usernameSplit);

            var player1 = game.players.find(e => user["user-id"] === e.twitchId);
            var player2 = game.players.find(e => usernameSplit === e.name);

            playerInPvp.push(player1, player2);

            if (usernameSplit === player1.name || username === player1.name) {
                return client.say(channel, "Tu ne peux pas t'affronter toi même...");
            }

            if (!player2) {
                return client.say(channel, "Le joueur n'existe pas...");
            }

            client.say(channel, `@${player1.name}` + " veux affronter " + `@${usernameSplit}` + " ! Utilisez " + `${prefix}oui pour accepter !`);
            if (refuseTimerIsOn === false) {
                declinePvp(channel);
            }
            
        } catch (error) {
            if (username === undefined) {
                return client.say(channel, "Veuillez saisir le nom de votre adversaire !");
            }
        }


    } else {
        client.say(channel, "Veuillez attendre que le défi se finisse avant d'en relancer un autre !");
    }
}

function checkIfInPVP(user) {

    var player = playerInPvp.find(e => user["user-id"] === e.twitchId);

    return player;

}

function acceptPvp(user, channel) {

    try {
        var player = game.players.find(e => user["user-id"] === e.twitchId);
        player2 = playerInPvp[1];

        if (checkIfInPVP && player.twitchId === player2.twitchId) {
            player1 = playerInPvp[0];
            client.say(channel, `@${player1.name} le défi a été accepté par @${player2.name} !`);
            pvpIsOn = true;
            fight(channel);

        } else {
            return client.say(channel, "Ce n'est pas vous qui avez été défié !");
        }
    } catch (error) {
        if(player2.twitchId === undefined) {
            return client.say(channel, "Oops, il semblerait qu'un fantôme souhaitait vous attaquer !");
        }
    }

    if (pvpIsOn === false) {
        return client.say(channel, "Il n'y a même pas de défi !");
    }
    
}

function rnd(top) {
    return (Math.floor(Math.random() * 100000) % (top + 1));
}

function delay() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve("waiting 30s");
        }, 30000);
    });
}

async function fight(channel) {

    player1 = playerInPvp[0];
    player2 = playerInPvp[1];

    if (checkIfInPVP) {

        while (player1.health > 0 || player2.health > 0) {

            await delay();

            var hpLoss = rnd(10 + (player1.attack - 1) * 3);

            if (hpLoss === 0) {
                client.say(channel, `@${player2.name}(${player2.health}❤️PV) a été attaqué par @${player1.name}(${player1.health}❤️PV) mais n'as reçu aucun dégâts ! FailFish`);

            } else if (hpLoss >= player1.level * 10) {
                client.say(channel, `@${player2.name}(${player2.health}❤️PV) a été attaqué par @${player1.name}(${player1.health}❤️PV) et a perdu ` + hpLoss + " ❤️PV ! Coup critique ! CurseLit KAPOW CurseLit");

            } else {
                client.say(channel, `@${player2.name}(${player2.health}❤️PV) a été attaqué par @${player1.name}(${player1.health}❤️PV) et a perdu ` + hpLoss + " ❤️PV ! KAPOW ");
            }

            player2.health -= hpLoss;

            if (player2.health <= 0) {
                client.say(channel, `@${player1.name} à vaincu @${player2.name} et a donc remporté le défi !`);
                pvpIsOn = false;
                playerInPvp = [];
                player1.health = player1.maxHealth;
                player2.health = player2.maxHealth;
                return;
            }

            await delay();

            var hpLoss = rnd(10 + (player2.attack - 1) * 3);

            if (hpLoss === 0) {
                client.say(channel, `@${player1.name}(${player1.health}❤️PV) a été attaqué par @${player2.name}(${player2.health}❤️PV) mais n'as reçu aucun dégâts ! FailFish`);

            } else if (hpLoss >= player2.level * 10) {
                client.say(channel, `@${player1.name}(${player1.health}❤️PV) a été attaqué par @${player2.name}(${player2.health}❤️PV) et a perdu ` + hpLoss + " ❤️PV ! Coup critique ! CurseLit KAPOW CurseLit");

            } else {
                client.say(channel, `@${player1.name}(${player1.health}❤️PV) a été attaqué par @${player2.name}(${player2.health}❤️PV) et a perdu ` + hpLoss + " ❤️PV ! KAPOW");
            }

            player1.health -= hpLoss;

            if (player1.health <= 0) {
                client.say(channel, `@${player2.name}(${player2.health}❤️PV) à vaincu @${player1.name}(${player1.health}❤️PV) et a donc remporté le défi !`);
                pvpIsOn = false;
                playerInPvp = [];
                player1.health = player1.maxHealth;
                player2.health = player2.maxHealth;
                return;
            }
        }
    }
}

function calculateExp(channel) {

    const mobLvl = game.monster.level;
    var expGained = 0;

    switch (mobLvl) {
        case 1:
            expGained = 100;
            break;
        case 2:
            expGained = 200;
            break;

        case 3:
            expGained = 300;
            break;

        case 4:
            expGained = 400;
            break;

        case 5:
            expGained = 500;
            break;

        case 6:
            expGained = 600;
            break;

        case 7:
            expGained = 700;
            break;

        case 8:
            expGained = 800;
            break;

        case 9:
            expGained = 900;
            break;

        case 10:
            expGained = 1000;
            break;

        default:
            break;
    }

    playerInBattle.forEach(element => {
        element.experience += expGained;

        while (element.level < maxLvlExp && element.experience >= lvlExp[element.level + 1]) {
            element.level++;
            element.health++;
            element.attack++;

            setTimeout(() => {
                client.say(channel, "🔥 " + `@${element.name}` + " passe niveau " + element.level + " et obtient 1 ❤️PV et 1 d'ATK⚡️ supplémentaire !");
            }, 2000);

        }
    });

}

var spawnCD = 60 * 10;
var spawnTimer = spawnCD;
var timerIsOn = false;

function spawnCountdown(user, channel) {
    var timer = setInterval(() => {
        spawnTimer--;
        timerIsOn = true;

        if (spawnTimer === 0) {
            clearInterval(timer);
            spawnTimer = spawnCD;
            timerIsOn = false;
            if (monsterHasSpawned === false) {
                randomBoss(user, channel);
            } else {
                client.say(channel, "🔥 Un monstre est déjà présent. Tuez le avant d'en faire apparaître un nouveau !");
            }
        }
    }, 1000);

}

var escapeCD = 60 * 2;
var escapeTimer = escapeCD;
escapeTimerIsOn = false;

function escape(user, channel) {
    var timer2 = setInterval(() => {
        escapeTimer--;
        escapeTimerIsOn = true;

        const player = game.players.find(e => user["user-id"] === e.twitchId);

        if (escapeTimer === 0) {
            clearInterval(timer2);
            escapeTimer = escapeCD;
            client.say(channel, "🔥 Le groupe à infligé " + totalDmg + " dégâts. Mais " + game.monster.name + " s'est enfuit !");
            game.monster = null;
            escapeTimerIsOn = false;
            monsterHasSpawned = false;
            player.hasAttacked = false;
            playerInBattle = [];
        }
    }, 1000);
}

var refusePvp = 60;
var refuseTimer = refusePvp;
var refuseTimerIsOn = false;

function declinePvp(channel) {
    var timer3 = setInterval(() => {
        refuseTimer--;
        refuseTimerIsOn = true;

        if (refuseTimer === 0 && pvpIsOn === false) {
            clearInterval(timer3);
            refuseTimer = refusePvp;
            client.say(channel, "Défi annulé !");
            pvpIsOn = false;
            refuseTimerIsOn = false;
            playerInPvp = [];
        }
    }, 1000);
}

client.connect();

client.on('connected', (addr, port) => {
    client.action('Ushysder_', '🔥 RPGBot a été initialisé ! Utilisez ' + `${prefix}help` + ' pour connaître les commandes disponibles.');
    console.log(`* Connected to ${addr}:${port}`);

})

client.on('chat', function (channel, user, message, self) {

    createPlayer(user);

    if (timerIsOn === false) {
        spawnCountdown(user, channel);
    }

    if (message.charAt(0) !== `${prefix}`) {
        return;
    }

    if (message === `${prefix}uptime`) {
        uptime(channel);
    }

    if (message === `${prefix}debug`) {
        // console.log(playerInBattle);
        console.log(playerInPvp);
        console.log(game);
    }

    if (message == `${prefix}help`) {
        client.action(channel, "🔥 Les commandes disponibles sont : " + `${prefix}` + "pvp, " + `${prefix}` + "oui, " + `${prefix}` + "bagarre, " + `${prefix}` + "stats, " + `${prefix}` + "uptime et " + `${prefix}` + "inv !")
    }

    if (checkIfExists(user)) {

        if (message === `${prefix}bagarre`) {
            bagarre(user, channel);
        }

        if (message === `${prefix}oui`) {
            acceptPvp(user, channel);
        }

        if (message === `${prefix}stats`) {
            checkStats(user, channel);
        }

        if (message === `${prefix}inv`) {
            checkInventory(user, channel);
        }

        if (message.startsWith(`${prefix}pvp`)) {
            pvp(user, channel, message);
        }

    }

})