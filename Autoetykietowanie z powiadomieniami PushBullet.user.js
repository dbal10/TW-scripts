// ==UserScript==
// @name         Autoetykietowanie z powiadomieniami PushBullet
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  try to take over the world!
// @author       Doopcia
// @match        https://*.plemiona.pl/game.php?*screen=overview_villages*mode=incomings*
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// @grant        GM.xmlHttpRequest
// ==/UserScript==

const PUSHBULLET_API_KEY = "o.axXRTghnvMMVhEMQ1lMIIt2RYUKXNptz";
const PUSHBULLET_API_KEY2 = "o.Grp5PjxLiJojU4h8oE7lr0fR8I92qYjd";

function randomIntFromInterval(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}

async function pushNotification(apiKey, params) {
    params = JSON.stringify(params);
    await GM.xmlHttpRequest({
        method: "POST",
        url: "https://api.pushbullet.com/v2/pushes",
        data: params,
        headers: {
            "Access-Token": apiKey,
            "Content-Type": "application/json"
        },
        onload: function(response) {
            console.log(response.responseText);
        }
    });
};

(() => {
    const _SETTINGS_ = {
        refreshIfSocketIsDead: randomIntFromInterval(133,164),
        forceRefreshing: true
    }

    const cellInfo = {
        order: 0,
        target: 1,
        origin: 2,
        player: 3,
        distance: 4,
        dateOfArrival: 5,
    };

    const app = {
        load() {
            if (!Connection.isConnected() || _SETTINGS_.forceRefreshing) {
                console.log(`connection to backend is not possible, next refresh in ${_SETTINGS_.refreshIfSocketIsDead} seconds`);
                setTimeout(() => window.location.reload(), _SETTINGS_.refreshIfSocketIsDead * 1000);
            }
            else {
                Connection.registerHandler("attack", (evnt) => {
                    window.location.reload();
                });
            }

            this._fillLabels();
        },

        async _fillLabels() {
            let ids_array_get = await GM.getValue("ids_array");
            console.log('stored_ids:', ids_array_get)
            let attack_row;
            let label;
            if(ids_array_get != undefined && ids_array_get.length > 0){
                ids_array_get = JSON.parse(ids_array_get);
                for (let id in ids_array_get){
                    console.log('loop:', ids_array_get[id])
                    label = $('[data-id="'+ ids_array_get[id] +'"]')[0];
                    console.log(label)
                    try{
                        label = label.getElementsByClassName('quickedit-label')[0].innerText;
                    }
                    catch{
                        GM.deleteValue("ids_array");
                        window.location.reload();
                    }
                    if(label == 'Szlachcic '){
                        attack_row = $('[data-id="'+ ids_array_get[id] +'"]').parent().parent()[0];
                        let targetVillage = attack_row.cells[1].firstElementChild.innerText.slice(0, -4);
                        let distance = attack_row.cells[4].innerText;
                        let arrivalTime = attack_row.cells[5].innerText;
                        let bodyString = 'Na wioske ' + targetVillage + ' z odległości ' + distance + ' dotrze ' + arrivalTime;

                        pushNotification(PUSHBULLET_API_KEY, {type: 'note', title: label, body: bodyString});
                        pushNotification(PUSHBULLET_API_KEY2, {type: 'note', title: label, body: bodyString});
                    }
                };
                GM.deleteValue("ids_array");
            }

            const rows = document.querySelectorAll("#incomings_table tr");
            const rowsArray = Array.from(rows).slice(1, -1);
            const result = [];
            let ids_array = [];

            rowsArray.forEach((row) => {
                const cells = row.querySelectorAll("td");
                const target = this._getDataFromUrl(cells[cellInfo.target]);
                const origin = this._getDataFromUrl(cells[cellInfo.origin]);
                const player = this._getPlayerInfo(cells[cellInfo.player]);
                const item = {
                    unit: cells[cellInfo.order].textContent.trim(),
                    player,
                    target,
                    origin,
                    $row: $(row),
                };

                result.push(item.$row);

                if (item.unit.toLowerCase() == "atak") {
                    const $checkbox = item.$row
                    .find('input[name^="command_ids"]')
                    .next();

                    ids_array.push(cells[0].childNodes[3].name.slice(3))

                    $checkbox.trigger('click');
                }
            });

            console.log('new ids:', ids_array)
            if(ids_array.length > 0){
                GM.setValue("ids_array", JSON.stringify(ids_array));
            }

            if (ids_array.length > 0) {
                setTimeout(() => $('input[value="Etykieta"]').trigger('click'), randomIntFromInterval(2622, 3511));
            }
        },

        _getPlayerInfo(element) {
            const src = element.querySelector("a");
            if (src !== null) {
                const url = new URL(src.href);
                const id = url.searchParams.get("id");

                return {
                    id,
                    name: src.textContent.trim(),
                };
            }
            return null;
        },

        _getDataFromUrl(element) {
            const href = element.querySelector("a");
            if (href !== null) {
                const url = new URL(href.href);

                let id = url.searchParams.get("id");
                let name = href.textContent.trim();
                let coords = name.match(/\(\d+\|\d+\)/g).join("");
                coords = coords.substring(1, coords.length - 1);

                return { id, name, coords };
            }
            return null;
        },
    };
    app.load();
})();